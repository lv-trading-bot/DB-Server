const historyCandlesRequire = 0;

const Feature = function() {

}

/**
 * @param {Number} i - index
 * @param {Array} candles - Array candles 
 */

Feature.prototype.update = function (i, candles) {
    return candles[i].close;
}


Feature.prototype.historyCandlesRequire = function() {
    return historyCandlesRequire;
}

module.exports = Feature;