//userController.js
const pool = require('../config/dbPool');
const bcrypt = require('bcrypt');
const salt = 10; //해시 강도

exports.joinUser = async (req, res) => {
    const { name, email, passwd, role } = req.body;
    const user = req.body;
    //응답: result=>[success, fail], message:결과메시지
    if (!name || !email || !passwd) {
        return res.status(400).json({ result: 'fail', message: '이름,이메일,비밀번호는 필수 입력입니다' });
    }
    try {
        // 비밀번호 암호화 처리
        const hashPasswd = await bcrypt.hash(passwd, salt);
        //로그인할 때는 bcrypt.compare(rawPwd, hashPwd)를 이용해서 사용자가 입력한 비번과 DB에서 가져온 암호화된 비번을 비교해서
        //일치하면 true반환

        const sql = `insert into members(name,email,passwd,role) values(?,?,?,?)`;
        const [result] = await pool.query(sql, [name, email, hashPasswd, role]);
        if (result.affectedRows > 0) {
            return res.json({
                result: 'success',
                message: `회원가입 완료. 등록된 회원번호는 ${result.insertId}번 입니다`,
            });
        }
        res.json({ result: 'fail', message: '회원가입 실패!! 다시 시도하세요' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ result: 'fail', message: 'error: ' + error.message });
    }
};
