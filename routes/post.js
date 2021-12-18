// routes/post.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, Hashtag } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

// uploads 폴더 없으면 생성
try {
    fs.readdirSync('uploads');
} catch (error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
}

const upload = multer({
    storage: multer.diskStorage({ // 어디에 저장할지
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) { // 어떤 이름으로 저장할지
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 파일 크기 제한
});

// 이미지 업로드
router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
    console.log(req.file);
    res.json({ url: `/img/${req.file.filename}` });
});

// 게시글 업로드
const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
    try {
        console.log(req.user);
        const post = await Post.create({ // 게시글 저장
            content: req.body.content,
            img: req.body.url, // 업로드한 이미지 주소
            UserId: req.user.id,
        });
        const hashtags = req.body.content.match(/#[^\s#]*/g); // 해시태그 추출
        if (hashtags) { // 해시태그가 있다면
            const result = await Promise.all( // [모델, 생성여부] 로 반환
                hashtags.map(tag => {
                    return Hashtag.findOrCreate({ // 해시태그가 존재하면 가져오고 존재하지 않으면 생성한 후 가져옴
                        where: { title: tag.slice(1).toLowerCase() }, // 앞에 #을 떼고 소문자로 바꿈
                    })
                }),
            );
            await post.addHashtags(result.map(r => r[0])); // 해시태그 모델들을 게시글과 연결
        }
        res.redirect('/');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;