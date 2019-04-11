var express = require('express');
var router = express.Router();
const candles = require('./candles');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/candles', candles);

module.exports = router;
