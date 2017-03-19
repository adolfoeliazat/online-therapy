var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/chat/', function(req, res, next) {
  res.send('Welcome to chat app');
});

module.exports = router;
