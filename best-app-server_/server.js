// server.js
const express = require('express');
require('dotenv').config();
//npm i dotenv morgan
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');

//라우터 가져오기
const indexRouter = require('./src/routes/indexRouter');
const postRouter = require('./src/routes/postRouter');
const userRouter = require('./src/routes/userRouter');
const loginRouter = require('./src/routes/loginRouter');
const adminRouter = require('./src/routes/adminRouter');

const port = process.env.PORT || 7777;
console.log('port: ', port);

const app = express();
//미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));
app.use(cors()); //react와 통신시 필요함

//라우터와 연결
app.use('/', indexRouter);
app.use('/api/posts', postRouter);
app.use('/api/users', userRouter);
app.use('/api/auth', loginRouter);
app.use('/api/admin', adminRouter); //인가 처리 미들웨어 넣을 예정

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
