const _ = require('lodash');

/**
 * Function generate candle
 * @param {Array} candle1m - array candle 1 minute
 * @param {Number} candleSize - Candle Size (minute)
 */
const buildCandles = function (candle1m, candleSize, from, to) {
    const MINUTE_IN_MILLISECONDS = 60000;
    let candles = [];
    let tempMem = [];

    let diff = candleSize * MINUTE_IN_MILLISECONDS;
    let begin = from,
        end = begin + diff;

    let length = candle1m.length;

    for (let i = 0; i < length; i++) {
        let curCandle1m = candle1m[i];

        // đã qua khoảng mới
        if (end <= curCandle1m.start) {
            candles.push(calculateCandle(tempMem, defaultStart = begin));
            // reset thông số
            tempMem = [];
            begin = end;
            end = begin + diff;
        }

        tempMem.push(curCandle1m);
    }

    // Nếu candle cuối đủ thì ghép luôn
    if ((to - begin) === candleSize * MINUTE_IN_MILLISECONDS) {
        candles.push(calculateCandle(tempMem, defaultStart = begin));
    }
    return candles;
}

const calculateCandle = (candle1m, defaultStart = null) => {
    var first = _.first(candle1m);

    var f = parseFloat;

    var candle = {
        start: defaultStart || first.start, //phòng trường hợp thiếu candle 1m đầu tiên
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