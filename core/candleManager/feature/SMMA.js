var SMA = require('./SMA');

const Feature = function (weight) {
    this.sma = new SMA(weight);
    this.weight = weight;
    this.prices = [];
    this.result = 0;
    this.age = 0;
}

/**
 * @param {Number} i - index
 * @param {Array} candles - Array candles 
 */
Feature.prototype.update = function (i, candles) {
    let price = candles[i].close;

    this.prices[this.age] = price;

    if(this.prices.length < this.weight) {
      this.sma.update(i, candles);
    } else if(this.prices.length === this.weight) {
      this.sma.update(i, candles);
      this.result = this.sma.result;
    } else {
      this.result = (this.result * (this.weight - 1) + price) / this.weight;
    }
  
    this.age++;

    return this.result;
}


Feature.prototype.historyCandlesRequire = function () {
    return this.weight;
}

module.exports = Feature;