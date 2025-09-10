// postController.js
// MVC패턴 (Model/View/Controller)
//DB 관련한 CRUD   로직 처리
const pool = require('../config/dbPool');
const fs = require('fs');
const path = require('path');

exports.createPost = async (req, res) => {
    console.log('createPost 들어옴');
    const { name, title, content } = req.body;
    //첨부파일은 req.file로 추출한다
    const file = req.file;
    console.log('file: ', file);
    let fileName = null;
    if (file) {
        fileName = file.filename; //실제 업로드된 파일명 => DB 저장
    }

    if (!name || !title) {
        return res.status(400).json({ result: 'fail', message: '작성자와 제목은 필수로 입력해야 해요' });
    }
    try {
        const sql = `insert into posts(name,title,content,attach)
                    values(?,?,?,?)`;

        const [result] = await pool.query(sql, [name, title, content, fileName]);
        if (result.affectedRows > 0) {
            return res.status(201).json({ result: 'success', message: `글 등록 성공 글번호: ${result.insertId}` });
        }
        res.json({ result: 'fail', message: '글 등록 실패' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ result: 'error', message: error.message });
    }
};
// /api/posts?page=1&size=3
//listPost
exports.listPost = async (req, res) => {
    //현재 보여줄 페이지 번호 받기 => 요청 쿼리 스트링에서 추출
    let page = parseInt(req.query.page) || 1; //현재 보여줄 페이지 번호
    const size = parseInt(req.query.size) || 3; //한 페이지 당 보여줄 목록 개수
    console.log('page: ', page, 'size: ', size);

    try {
        //1. 전체 게시글 수 가져오기
        const sql = `select count(id) count from posts`;
        const [[{ count }]] = await pool.query(sql);
        // console.log('result: ', result[0][0].count); //result=[ [ { count: 9 } ], [ `count` BIGINT(21) NOT NULL ] ]
        console.log('count: ', count);

        // 1_2. 총 페이지 수 구하기
        const totalPages = Math.ceil(count / size);
        if (page < 1) {
            page = 1; //디폴트 페이지: 1페이지로 설정
        }
        if (page > totalPages) {
            page = totalPages; //마지막 페이지 보여주도록 설정
        }

        const offset = (page - 1) * size; //DB에서 데이터 끊어올 때 시작값

        //2. 전체 게시목록 가져오기
        const sql2 = `select id,name,title,content,
        attach as file, date_format(wdate,'%Y-%m-%d') as wdate
        from posts order by id desc limit ? offset ?`; //limit ?,? ==> [offset, size]
        const [posts] = await pool.query(sql2, [size, offset]);
        console.log('posts: ', posts);

        //응답 { data:[{},{}], totalCount:10}
        res.json({ data: posts, totalCount: count, totalPages, page, size });
    } catch (error) {
        console.error(error);
        res.status(500).json({ result: 'error', message: error.message });
    }
};
//글번호로 글 내용 보기  /api/posts/20
exports.getPostById = async (req, res) => {
    const { id } = req.params;
    console.log('id: ', id);
    try {
        const sql = `select id,title,content,name, attach as file,
            date_format(wdate,'%Y-%m-%d %H:%i:%s') wdate
            from posts where id=?`;

        const [rows] = await pool.query(sql, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ result: 'fail', message: '해당 Post글이 존재하지 않습니다' });
        }
        console.log('rows: ', rows);

        res.json({ data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ result: 'error', message: error.message });
    }
};

//deletePost 구성해서 delete문 실행시키기
exports.deletePost = async (req, res) => {
    ///api/posts/3
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ result: 'fail', message: '잘못된 요청입니다' });
    }
    try {
        //1. 해당 게시글의 첨부파일명을 가져와서
        const sql = `select attach as file from posts where id=?`;
        const [result] = await pool.query(sql, [id]);
        if (result.length === 0) {
            return res.status(404).json({ result: 'fail', message: '해당 글은 존재하지 않습니다' });
        }
        const data = result[0];
        let filePath = null;
        if (data.file) {
            filePath = path.join(__dirname, '..', '..', 'public', 'uploads', data.file);
        }
        console.log('filePath: ', filePath);

        //2. DB에서 해당 글 삭제 처리
        const sql2 = `delete from posts where id=?`;
        const [result2] = await pool.query(sql2, [id]);
        if (result2.affectedRows === 0) {
            return res.status(404).json({ result: 'fail', message: '해당 글은 존재하지 않습니다' });
        }
        //3. 첨부파일이 있다면 서버 uploads폴더에서 해당 파일 삭제 처리
        if (fs.existsSync(filePath)) {
            console.log('***********');
            fs.unlinkSync(filePath); //파일을 동기방식으로 삭제하는 함수. 비동기: fs.unlik()
        }
        res.json({ result: 'success', message: `${id}번 글을 삭제했습니다` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ result: 'error', message: error.message });
    }
};
exports.updatePost = async (req, res) => {
    const { id } = req.params;
    //수정할 글 내용
    const { name, title, content } = req.body;
    const file = req.file; //새로 수정처리할 첨부파일
    let fileName = file?.filename; //새로 업로드한 파일명: 시간정보_파일명

    let filePath = null; //예전 첨부파일 경로 담을 예정
    try {
        //1.새로 업로드한 파일이 있다면 글번호로 예전에 첨부했던 파일명 가져오기
        if (file) {
            const sql = `select attach as file from posts where id=?`;

            const [result] = await pool.query(sql, [id]);
            if (result.length === 0) {
                return res.status(404).json({ result: 'fail', message: '해당 글은 없습니다' });
            }
            const data = result[0];

            if (data.file) {
                filePath = path.join(__dirname, '..', '..', 'public', 'uploads', data.file);
                //예전에 첨부했던 파일이름을 절대경로로 만들자
            }
        } //if----------------
        //2. DB에서 해당 글 수정 처리-update문 수행
        let sql2 = `update posts set name=?, title=?,content=? `;

        const params = [name, title, content];

        if (file) {
            sql2 += `, attach=? `;
            params.push(fileName);
        }
        sql2 += ` where id=?`;
        params.push(id);
        console.log('sql2: ', sql2);
        console.log('params: ', params);
        const [result2] = await pool.query(sql2, params);
        if (result2.affectedRows === 0) {
            return res.status(404).json({ result: 'fail', message: '해당 글이 없습니다' });
        }

        //3. 1번에서 가져온 예전 첨부파일명이 있다면 => 삭제 처리
        if (filePath && fs.existsSync(filePath)) {
            console.log('>>>파일 삭제 처리 중<<<');
            fs.unlinkSync(filePath); //기존 첨부파일 삭제 처리
        }
        res.json({ result: 'success', message: `${id}번 Post글 수정처리 완료` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ result: 'error', message: error.message });
    }
};
