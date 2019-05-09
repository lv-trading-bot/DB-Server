const talib = require('talib');
const _ = require('lodash');

class AverageDirectionalIndex {
  constructor({
    period
  }) {
    this.period = period || 14;
    this.executedResults = [];
  }

  update(index, candles) {
    return new Promise((resolve, reject) => {
      //calculate once for all
      if (index === 0) {
        talib.execute({
          name: "ADX",
          startIdx: 0,
          endIdx: candles.length - 1,
          high: _.map(candles, 'high'),
          low: _.map(candles, 'low'),
          close: _.map(candles, 'close'),
          optInTimePeriod: this.period
        }, (err, result) => {
          if (err) {
            console.log(err);
            reject(-1);
          }
          const rawResult = result.result.outReal;
          // fill 'ghost' results for those optInPeriod candles
          this.executedResults = Array(candles.length - rawResult.length).fill(-1).concat(rawResult)
          resolve(this.executedResults[0]);
        })
      } else {
        resolve(this.executedResults[index]);
      }
    })
  }

  historyCandlesRequire() {
    // recommended value for better smoothing
    return 150;
  }
}

module.exports = AverageDirectionalIndex