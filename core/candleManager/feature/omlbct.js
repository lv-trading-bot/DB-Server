const historyCandlesRequire = 0;


const Feature = function (params = {
    takeProfit: 2,
    stopLoss: -10,
    expirationPeriod: 24
}) {
    this.params = params;
}

const calculateTrendByPercentage = function (price, futurePrice) {
    if (price <= 0) return 0;
    return (futurePrice - price) * 100 / Math.abs(price);
}

const classify = (index, candles, settings) => {
    const STAY = 0,
        BUY = 1;

    for (let i = index; i < candles.length; i++) {

        if (i >= candles.length - settings.expirationPeriod) // last h candles will be ignored
            return STAY;
        else {
            let profitLimitFlag = 0,
                stopLimitFlag = 0;

            // see if within h candles, will profit limit be triggered?
            for (let j = i + 1; j <= i + settings.expirationPeriod; j++) {
                let upTrend = calculateTrendByPercentage(
                    candles[i].close,
                    candles[j].high
                );
                let downTrend = calculateTrendByPercentage(
                    candles[i].close,
                    candles[j].low
                );

                if (downTrend <= settings.stopLoss) {
                    stopLimitFlag = 1;
                    break;
                } else if (upTrend >= settings.takeProfit) {
                    profitLimitFlag = 1;
                    break;
                } else continue;
            }

            //classify the candle action into BUY or STAY according to flags
            if (stopLimitFlag === 1 || (stopLimitFlag === 0 && profitLimitFlag === 0)) return STAY;
            else return BUY;

        }
    }
    return STAY;
}

/**
 * @param {Number} i - index
 * @param {Array} candles - Array candles 
 */

Feature.prototype.update = function (i, candles) {
    return classify(i, candles, this.params);
}


Feature.prototype.historyCandlesRequire = function () {
    return historyCandlesRequire;
}

module.exports = Feature;