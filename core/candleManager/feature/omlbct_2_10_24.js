const historyCandlesRequire = 0;

const Feature = function () {

}

const classify = (i, candles) => {
    //classify candle action
    // const STAY = 0,
    //     BUY = 1;
    // for (let i = 0; i < this.candles.length; i++) {
    //     this.candles[i].start = new Date(this.candles[i].start).getTime();
    //     if (i >= this.candles.length - this.settings.stopTrade) // last h candles will be ignored
    //         this.candles[i].action = STAY;
    //     else {
    //         let profitLimitFlag = 0,
    //             stopLimitFlag = 0;

    //         // see if within h candles, will profit limit be triggered?
    //         for (let j = i + 1; j <= i + this.settings.stopTrade; j++) {
    //             let upTrend = calculateTrendByPercentage(
    //                 this.candles[i].close,
    //                 this.candles[j].high
    //             );
    //             let downTrend = calculateTrendByPercentage(
    //                 this.candles[i].close,
    //                 this.candles[j].low
    //             );

    //             if (downTrend <= this.settings.stopLoss) {
    //                 stopLimitFlag = 1;
    //                 break;
    //             } else if (upTrend >= this.settings.takeProfit) {
    //                 profitLimitFlag = 1;
    //                 break;
    //             } else continue;
    //         }

    //         //classify the candle action into BUY or STAY according to flags
    //         if (stopLimitFlag === 1 || (stopLimitFlag === 0 && profitLimitFlag === 0)) this.candles[i].action = STAY;
    //         else this.candles[i].action = BUY;

    //     }
    // }
    return 0;
}

/**
 * @param {Number} i - index
 * @param {Array} candles - Array candles 
 */

Feature.prototype.update = function (i, candles) {
    return classify(i, candles);
}


Feature.prototype.historyCandlesRequire =  function() {
    return historyCandlesRequire;
}

module.exports = Feature;