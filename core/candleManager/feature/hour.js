const moment = require('moment');

class HourInDay {
  constructor() {}

  update(index, candles) {
    return moment(parseInt(candles[index].start)).utc().hour();
  }

  historyCandlesRequire() {
    return 0;
  }
}

module.exports = HourInDay