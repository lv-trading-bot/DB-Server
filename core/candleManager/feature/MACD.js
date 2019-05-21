var EMA = require('./EMA');
const _ = require('lodash');

const Feature = function ({short, long, signal}) {
  this.diff = false;
  this.config = {short, long, signal};
  this.short = new EMA(short);
  this.long = new EMA(long);
  this.signal = new EMA(signal);
}

/**
 * @param {Number} i - index
 * @param {Array} candles - Array candles 
 */
Feature.prototype.update = function (i, candles) {
  this.short.update(i, candles);
  this.long.update(i, candles);
  this.calculateEMAdiff();
  this.signal.update(0, [{close: this.diff}]);
  this.result = this.diff - this.signal.result;

  return this.result;
}

Feature.prototype.calculateEMAdiff = function() {
  var shortEMA = this.short.result;
  var longEMA = this.long.result;

  this.diff = shortEMA - longEMA;
}

Feature.prototype.historyCandlesRequire = function () {
    return _.max([this.config.short, this.config.long, this.config.signal]);
}

module.exports = Feature;