var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('auth');
});

router.get('/home', function(req,res,next){
  res.render('home');
});

router.post('/user/register', function(req,res,next){

});

router.post('/user/login', function(req,res,next){
  
});

module.exports = router;
