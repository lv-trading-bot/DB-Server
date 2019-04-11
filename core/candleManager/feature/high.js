const candleRequire = 0;

const Feature = function() {

}

Feature.prototype.update = function (candle) {
    return candle.high;
}


Feature.prototype.candleRequire = function() {
    return candleRequire;
}

module.exports = Feature;