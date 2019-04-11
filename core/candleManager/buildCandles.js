const _ = require('lodash');

/**
 * Function generate candle
 * @param {Array} candle1m - array candle 1 minute
 * @param {Number} candleSize - Candle Size (minute)
 */
const buildCandles = function (candle1m, candleSize) {
    let candles = [];
    let diff = candleSize * 60 * 1000;
    let begin = -1, end = -1, length = candle1m.length;
    let tempMem = [];
    for (let i = 0; i < length; i++) {
        let curCandle1m = candle1m[i];
        if (end <= curCandle1m.start && end !== -1) {
            candles.push(caculaCandle(tempMem));
            tempMem = [];
            begin = -1;
            end = -1;
        }

        if (begin === -1) {
            begin = curCandle1m.start;
            end = begin + diff;
        }
        tempMem.push(curCandle1m);
    }

    // Nếu candle cuối đủ thì ghép luôn
    if(tempMem.length === candleSize) {
        candles.push(caculaCandle(tempMem));
        tempMem = [];
        begin = -1;
        end = -1;
    }
    return candles;
}

const caculaCandle = (candle1m) => {
    var first = _.first(candle1m);

    var f = parseFloat;

    var candle = {
        start: first.start,
        open: f(first.open),
        high: f(first.high),
        low: f(first.low),
        close: f(_.last(candle1m).close),
        volume: 0,
        trades: 0
    };

    _.each(candle1m, function (_candle) {
        candle.high = _.max([candle.high, f(_candle.high)]);
        candle.low = _.min([candle.low, f(_candle.low)]);
        candle.volume += f(_candle.volume);
        candle.trades += f(_candle.trades);
    });

    return candle;
}

module.exports = buildCandles;