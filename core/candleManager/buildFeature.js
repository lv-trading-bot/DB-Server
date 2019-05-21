const moment = require('moment');
const buildCandle = require('./buildCandles');
const _ = require('lodash');
const log = require('../../log');


/**
 * @param {String} exchangeName - Name of exchange
 * @param {String} asset - Name of Asset
 * @param {String} currency - Name of Currency
 * @param {Number} candleSize - Number per minute
 * @param {Number} from - minisecond(utc)
 * @param {Number} to - minisecond(utc)
 * @param {Array} features - array of features
 * @param {Object} database - instance of database
 */
const buildFeature = function (exchangeName, asset, currency, candleSize, from, to, features, database) {
    return new Promise(async (resolve, reject) => {
        // Load feature và xem candle lịch sử cần lấy tối đa là bao nhiêu
        let maxHistoryCandle = 0;
        let listFeature = [];
        for (let i = 0; i < features.length; i++) {
            try {
                if (typeof features[i] === 'string') {
                    features[i] = {
                        name: features[i]
                    }
                }
                let feature = new(require('./feature/' + features[i].name))(features[i].params);
                let candleRequre = feature.historyCandlesRequire();
                maxHistoryCandle = candleRequre > maxHistoryCandle ? candleRequre : maxHistoryCandle;
                listFeature.push({
                    name: features[i].name,
                    feature
                });
            } catch (error) {
                // load k được thì bỏ qua
                log.error(error);
            }
        }

        let minuteWillAddBefore = maxHistoryCandle * candleSize;
        let finalFrom = moment(from).utc().subtract(minuteWillAddBefore, 'm');
        let finalTo = moment(to).utc();

        // Get candle 1m from database
        let candle1m = await database.readCandles(
            exchangeName,
            asset,
            currency,
            finalFrom,
            finalTo);

        let candles = await buildCandle(candle1m, candleSize, finalFrom.valueOf(), finalTo.valueOf());
        let retCandles = [];
        for (let i = 0; i < candles.length; i++) {
            let retCandle = {};
            for (let j = 0; j < listFeature.length; j++) {
                retCandle[listFeature[j].name] = await listFeature[j].feature.update(i, candles);
            }
            retCandles.push(retCandle);
        }

        let finalResult = _.filter(retCandles, (candle) => {
            return (parseInt(candle.start) >= parseInt(from))
        })

        resolve(finalResult);
    })
}

module.exports = buildFeature;