var SMMA = require('./SMMA');

const Feature = function ({interval}) {
  this.lastClose = null;
  this.weight = interval || 14;
  this.avgU = new SMMA(this.weight);
  this.avgD = new SMMA(this.weight);
  this.u = 0;
  this.d = 0;
  this.rs = 0;
  this.result = 0;
  this.age = 0;
}

/**
 * @param {Number} i - index
 * @param {Array} candles - Array candles 
 */
Feature.prototype.update = function (i, candles) {
  let candle = candles[i];

  var currentClose = candle.close;

  if (this.lastClose === null) {
    // Set initial price to prevent invalid change calculation
    this.lastClose = currentClose;

    // Do not calculate RSI for this reason - there's no change!
    this.age++;
    return;
  }

  if (currentClose > this.lastClose) {
    this.u = currentClose - this.lastClose;
    this.d = 0;
  } else {
    this.u = 0;
    this.d = this.lastClose - currentClose;
  }

  this.avgU.update(0, [{close: this.u}]);
  this.avgD.update(0, [{close: this.d}]);

  this.rs = this.avgU.result / this.avgD.result;
  this.result = 100 - (100 / (1 + this.rs));

  if (this.avgD.result === 0 && this.avgU.result !== 0) {
    this.result = 100;
  } else if (this.avgD.result === 0) {
    this.result = 0;
  }

  this.lastClose = currentClose;
  this.age++;

    return this.result;
}


Feature.prototype.historyCandlesRequire = function () {
    return this.weight;
}

module.exports = Feature;