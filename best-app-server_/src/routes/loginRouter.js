const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');
const verifyMiddleware = require('../middlewares/verifyMiddleware');
// /api/auth/login

router.post(`/login`, loginController.login);
router.post(`/logout`, loginController.logout);
router.get('/user', verifyMiddleware.verifyAccessToken, loginController.getAuthenticUser); //accessToken이 유효한지 검증하는 미들웨어
// router.get(`/mypage`,verifyMiddleware.verifyAccessToken,loginController.mypage)
router.post('/refresh', loginController.refreshVerify);
router.get('/mypage', verifyMiddleware.verifyAccessToken, loginController.mypage);

module.exports = router;
