// verifyMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

//accessToken을 검증하는 미들웨어
exports.verifyAccessToken = (req, res, next) => {
    console.log(req.headers); //Authorization: Bearer ejsx...
    const token = req.headers['authorization']?.split(' ')[1]; //[Bearer, ejsx...]
    console.log('token: ', token);
    if (!token) return res.status(400).json({ result: 'fail', message: '인증 토큰이 필요합니다. 로그인 하세요' });

    //토큰 검증하기
    jwt.verify(token, process.env.ACCESS_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ result: 'fail', message: '유효하지 않은 사용자 입니다' });
        }
        req.authUser = decoded;
        next(); //검증 미들웨어 통과시 다음 작업 진행
    });
};

//관리자 권한을 체크하는 미들웨어
exports.verifyAdmin = (req, res, next) => {
    if (!req.authUser) {
        return res.status(401).json({ message: '사용자 인증이 필요합니다' });
    }
    if (req.authUser.role !== 'ADMIN') {
        return res.status(403).json({ message: '관리자 권한이 필요합니다' });
    }
    next(); //관리자라면 next()호출
};
