const utils = require('../../utils');
const moment = require("moment");
const config = utils.getConfig();
const buildFeature = require('./buildFeature');

const CandleManager = function () {

}

const adapterDatabase = config.adapterDatabase;
const configDatabase = config[adapterDatabase];

let database = new (require('../database/' + adapterDatabase))(configDatabase);

/**
 * @param {String} exchangeName - Name of exchange
 * @param {String} asset - Name of Asset
 * @param {String} currency - Name of Currency
 * @param {Number} candleSize - Number per minute
 * @param {Number} from - minisecond(utc)
 * @param {Number} to - minisecond(utc)
 * @param {Array} features - array of features
 */
CandleManager.prototype.getCandles = function (exchangeName, asset, currency, candleSize, from, to, features) {
    return new Promise(async (resolve, reject) => {
        if (!database) {
            database = new (require('../database/' + adapterDatabase))(configDatabase);
        }
        let res = await buildFeature(exchangeName, asset, currency, candleSize, from, to, features, database)
        resolve(res)
    })
}

module.exports = CandleManager;