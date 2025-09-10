// userRouter.js
const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

router.get('/', (req, res) => {
    const str = `
        <div>
            <h1>Users</h1>
        </div>
    `;
    res.send(str);
});
//회원가입
router.post('/', userController.joinUser);
module.exports = router;
