//adminRouter.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verifyMiddleware = require('../middlewares/verifyMiddleware');
// /api/admin
router.get('/users', verifyMiddleware.verifyAccessToken, verifyMiddleware.verifyAdmin, adminController.listUser);
//미들웨어 2가지

module.exports = router;
