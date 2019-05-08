class PlusDirectionalMovement {
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
    result = currentCandle.high - previousCandle.high;

    return (result > 0 ? result : 0);
  }

  historyCandlesRequire() {
    return 1;
  }
}

module.exports = PlusDirectionalMovement