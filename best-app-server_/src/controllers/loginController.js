// loginController.js
//npm i jsonwebtoken
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../config/dbPool');

//JWT 토큰을 생성하는 함수
const generateToken = (user, secret, expirein) => {
    return jwt.sign(user, secret, { expiresIn: expirein });
};

exports.login = async (req, res) => {
    const { email, passwd } = req.body;
    console.log('email: ', email, 'passwd: ', passwd);
    try {
        //1. DB members테이블에 email로 회원정보 가져오기
        const sql = `select id,name,email,passwd,role from members where email=?`;
        //1_2. 회원정보 없는 경우(=> email이 틀린 경우)
        const [result] = await pool.query(sql, [email]);
        if (result.length === 0)
            return res.status(401).json({ result: 'fail', message: '아이디 또는 비밀번호가 일치하지 않아요' });
        const tmpUser = result[0]; //회원정보 꺼내기
        //2. 비밀번호 일치 여부 체크 => bcrypt.compare()함수 이용
        const isMatch = await bcrypt.compare(passwd, tmpUser.passwd);
        console.log('isMatch: ', isMatch, passwd, tmpUser.passwd);
        // const isMatch = passwd === tmpUser.passwd;

        //암호화된 비번: mpUser.passwd  사용자가 입력한 비번: passwd 비교해서 일치하면 true반환
        //2_2. 비번 불일치 처리
        if (!isMatch) {
            return res.status(401).json({ result: 'fail', message: '아이디 또는 비밀번호가 일치하지 않아요' });
        }
        //3. 회원으로 인증 받은 경우 ===> accessToken과 refreshToken을 생성
        //  accessToken: 15분, refreshToken: 1시간
        const { passwd: _, ...userPayload } = tmpUser;
        console.log('userPayload: ', userPayload);
        const accessToken = generateToken(userPayload, process.env.ACCESS_SECRET, '15m'); //15분
        const refreshToken = generateToken(userPayload, process.env.REFRESH_SECRET, '1h'); //1시간
        console.log('accessToken: ', accessToken);
        console.log('refreshToken: ', refreshToken); //DB 보관

        //4. members테이블에서 인증받은 회원의 refreshToken값을 수정해야 함
        const sql2 = `update members set refreshToken=? where email=?`;
        await pool.query(sql2, [refreshToken, email]);

        //5. 응답 전송(accessToken,refreshtoken,userPayload 데이터 전달)
        res.json({ result: 'success', message: '로그인 성공!!', data: { accessToken, refreshToken, ...userPayload } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ result: 'fail', message: '회원 인증 실패: ' + error.message });
    }
};
//로그아웃 처리---------------------------------
exports.logout = async (req, res) => {
    //1. 이메일 값 받기
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ result: 'fail', message: '유효하지 않은 요청입니다' });
    }
    try {
        //2. members테이블에서 해당 회원의 refreshToken값을 null로 수정 처리
        const sql = `update members set refreshToken=null where email=?`;
        const [result] = await pool.query(sql, [email]);
        if (result.affectedRows === 0) {
            return res.status(400).json({ result: 'fail', message: '유효하지 않은 요청입니다' });
        }
        //3. 응답 {result:'success', message:'로그아웃 처리되었어요'}
        res.json({ result: 'success', message: '로그아웃 처리되었어요' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ result: 'fail', message: '로그아웃 실패: ' + error.message });
    }
};
exports.getAuthenticUser = (req, res) => {
    res.json(req.authUser);
};
//refreshToken을 검증하여 타당할 경우 새 억세스토큰 발급
exports.refreshVerify = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).json({ result: 'fail', message: '유효한 사용자가 아닙니다-refreshToken없어요' });
    }
    jwt.verify(refreshToken, process.env.REFRESH_SECRET, async (err, decoded) => {
        if (err) {
            //유효하지 않은 토큰인 경우
            return res.status(403).json({ result: 'fail', message: '유효하지 않은 refreshToken입니다' });
        }
        //유효한 토큰일 경우 => members에서 refreshToken으로 회원정보 가져오기
        const sql = `select id,name,email,role from members where refreshToken=?`;
        try {
            const [result] = await pool.query(sql, [refreshToken]);
            if (result.length === 0) {
                return res.status(403).json({ result: 'fail', message: '인증받지 않은 회원입니다' });
            }
            const user = result[0];
            //새 accessToken발급
            const newAccessToken = generateToken(user, process.env.ACCESS_SECRET, '15m');
            res.json({ accessToken: newAccessToken });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ result: 'error', message: 'Server Error: ' + error.message });
        }
    }); //verify
};
exports.mypage = async (req, res) => {
    try {
        if (!req.authUser) return res.status(404).json({ result: 'fail', message: '로그인해야 이용 가능해요' });
        const id = req.authUser.id;
        const sql = `select * from members where id=?`;
        const [result] = await pool.query(sql, [id]);
        if (result.length === 0) {
            return res.status(404).json({ result: 'fail', message: '회원이 아닙니다' });
        }
        const { passwd: _, ...userData } = result[0];
        return res
            .status(200)
            .json({ result: 'success', message: `${userData.name}님의 MyPage입니다`, data: userData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ result: 'fail', message: 'DB Error : ' + error });
    }
};
