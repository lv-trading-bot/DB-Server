var express = require('express');
var router = express.Router();
const candles = require('../controllers/candles');

/* GET users listing. */
router.post('/', candles.postCandles);

module.exports = router;
