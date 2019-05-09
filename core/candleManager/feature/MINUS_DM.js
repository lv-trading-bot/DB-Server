class MinusDirectionalMovement {
  constructor() {
    this.age = 0;
  }

  update(index, candles) {
    currentCandle = candles[index]

    if (this.age === 0 || index === 0) {
      this.age++;
      return;
    }

    previousCandle = candles[index - 1];
    result = previousCandle.low - currentCandle.low;

    return (result > 0 ? result : 0);
  }

  historyCandlesRequire() {
    return 1;
  }
}

module.exports = MinusDirectionalMovement