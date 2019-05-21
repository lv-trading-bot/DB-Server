const Feature = function (windowLength) {
    this.windowLength = windowLength;
    this.prices = [];
    this.result = 0;
    this.age = 0;
    this.sum = 0;
}

/**
 * @param {Number} i - index
 * @param {Array} candles - Array candles 
 */
Feature.prototype.update = function (i, candles) {
    let price = candles[i].close;
    var tail = this.prices[this.age] || 0; // oldest price in window
    this.prices[this.age] = price;
    this.sum += price - tail;
    this.result = this.sum / this.prices.length;
    this.age = (this.age + 1) % this.windowLength;
    return this.result;
}


Feature.prototype.historyCandlesRequire = function () {
    return this.windowLength;
}

module.exports = Feature;