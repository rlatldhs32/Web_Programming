const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
//#models로부터 Post,User,Hashtag 가져옴
const { Post, User, Hashtag } = require('../models');

const router = express.Router();

//변수 설정
router.use((req, res, next) => {  //다른라우터에도 사용 가능 전역 객체 저장하는것 , 
  res.locals.user = req.user;
  res.locals.followerCount = 0;
  res.locals.followingCount = 0;
  res.locals.followerIdList = []; //팔로우
  next();
});

router.get('/', (req, res, next) => {
  res.render('layout', { title: 'Start' });
});

router.get('/account', isNotLoggedIn, (req, res, next) => { //로그인 된 상태면 
  res.render('account', { title: '회원가입' });
});
router.get('/profile', isLoggedIn, (req, res, next) => { //내
  res.render('profile', { title: '내 정보 ' });
});


router.get('/home', isLoggedIn, (req, res, next) => { //로그인 된 상태면 
  res.render('home', { title: '홈페이지' });
});

router.get('/new', isLoggedIn, (req, res, next) => { //로그인 된 상태면 
  res.render('new', { title: '업로드' });
});

router.get('/follow', isLoggedIn, (req, res, next) => { //로그인 된 상태면 
  res.render('follow', { title: '팔로우' });
});
router.get('/message', isLoggedIn, (req, res, next) => { //로그인 된 상태면 
  res.render('message', { title: '메세지' });
});


//??
/*
router.get('/', (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ['id', 'nick'],
      },
      order: [['createdAt', 'DESC']],
    });
    res.render('main', {
      title: 'NodeBird',
      twits: posts,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
  // const twits = [];
  // res.render('main', {
  //   title: 'NodeBird',
  //   twits,
  // }); 
});
*/
//해시태그 검색
router.get('/hashtag', async (req, res, next) => {
  const query = req.query.hashtag; //해시태그 이름
  if (!query) { //입력된 해시태그 값이 없으면
    return res.redirect('/home'); //돌아감
  }
  try {
    //해시태그 조회
    const hashtag = await Hashtag.findOne({ where: { title: query } });
    let posts = [];
    if (hashtag) {
      //해시태그와 연결된 게시물들 조회
      posts = await hashtag.getPosts({ include: [{ model: User }] });//
    }
    return res.render('main', {
      title: `${query} | Sion`,
      twits: posts, //게시글 렌더링
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});


module.exports = router;

