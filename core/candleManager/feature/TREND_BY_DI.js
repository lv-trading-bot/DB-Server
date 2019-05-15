const PlusDI = require('./PLUS_DI');
const MinusDI = require('./MINUS_DI');

class TrendByDirectionalIndex {
  constructor({
    period
  }) {
    this.period = period || 14;
    this.executedResults = [];
    this.plusDI = new PlusDI({period: period});
    this.minusDI = new MinusDI({period: period});
  }

  async update(index, candles) {
    const result = await this.plusDI.update(index, candles) - await this.minusDI.update(index, candles);
    return result;
  }

  historyCandlesRequire() {
    return this.period;
  }
}

module.exports = TrendByDirectionalIndex