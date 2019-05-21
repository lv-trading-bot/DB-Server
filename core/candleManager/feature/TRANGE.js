const _ = require('lodash');

class TrueRange {
  constructor() {
    this.age = 0;
  }

  update(index, candles) {
    currentCandle = candles[index]

    if (this.age === 0 && index === 0) {
      this.age++;
      return;
    }

    previousCandle = candles[index - 1]

    return _.max([
      currentCandle.high - currentCandle.low,
      Math.abs(currentCandle.high - previousCandle.close),
      Math.abs(currentCandle.low - previousCandle.close),
    ])
  }

  historyCandlesRequire() {
    return 1;
  }
}

module.exports = TrueRange