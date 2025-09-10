// postRouter.js
const express = require('express');
const postController = require('../controllers/postController');
const multer = require('multer'); //파일업로드 모듈
//npm i multer
const path = require('path');
const router = express.Router();

//파일 업로드 관련 설정
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        const upPath = path.join(__dirname, '..', '..', 'public', 'uploads');
        callback(null, upPath);
        //콜백함수에 업로드할 디렉토리 경로 전달
    },
    filename: function (req, file, callback) {
        //한글 파일 깨짐
        const encode_filename = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const filename = Date.now() + '_' + encode_filename;

        //업로드할 파일명=업로드한날짜시간정보_원본파일명
        callback(null, filename);
    },
});
const upMulter = multer({ storage });

// /api/posts ==> postRouter
// router.get('/', (req, res) => {
//     const str = `
//         <div>
//             <h1>Posts</h1>
//         </div>
//     `;
//     res.send(str);
// });

//파일업로드 처리 필요 (multer미들웨어 설정해야 함)
router.post('/', upMulter.single('file'), postController.createPost);

//모든 포스트 목록 조회
router.get('/', postController.listPost);

router.get('/:id', postController.getPostById);

//글 번호로 삭제 처리
router.delete('/:id', postController.deletePost);

//글 수정 처리
router.put('/:id', upMulter.single('file'), postController.updatePost);

module.exports = router;
