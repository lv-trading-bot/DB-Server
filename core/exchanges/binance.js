const baseUrl = " https://api.binance.com";
const apiGetKlines = "/api/v1/klines";
const limit = 1000;
const key_Value = [
    'start',
    'open',
    'high',
    'low',
    'close',
    'volume',
    'end_time',
    'quote_asset_volume',
    'trades',
    'taker_buy_base_asset_volume',
    'taker_buy_quote_asset_volume',
    'ignore'
];

const axios = require('axios');
const _ = require('lodash');
const moment = require('moment');
const log = require('../../log');
const utils = require('../../utils');
const numberLimitRequestPerMinuteOfBinace = 1100;

let numberOfRequestPerMinute = numberLimitRequestPerMinuteOfBinace;

setTimeout(() => {
    setInterval(() => {
        numberOfRequestPerMinute = 0;
    }, 1000 * 60);
}, (60 * 1000 - parseInt(moment().millisecond())))

/**
 * @param {string} asset - Example "ETH", "BTC",...
 * @param {string} currency - Example "USDT", "BTC",...
 */
const Binance = function (asset, currency) {
    this.currency = currency;
    this.asset = asset;
    this.pair = `${_.upperCase(asset)}${_.upperCase(currency)}`;
}

/**
 * @param {Object} startTime - Moment
 * @param {Object} endTime - Moment, startTime và endTime không cách nhau quá 12h
 */
Binance.prototype.getCandles = function (startTime, endTime) {
    return new Promise(async (resolve, reject) => {

        if(numberOfRequestPerMinute >= numberLimitRequestPerMinuteOfBinace) {
            log.warn(`Request to Binace is ${numberOfRequestPerMinute} over ${numberLimitRequestPerMinuteOfBinace}, sleep 30s.`)
            await utils.wait(30 * 1000);
            return resolve(await this.getCandles(startTime, endTime));
        }
        numberOfRequestPerMinute++;
        let oldNumberofRequestPerMinute = numberOfRequestPerMinute;

        let reqData = {
            symbol: this.pair,
            startTime: startTime.startOf('minute').utc().unix() * 1000,
            endTime: endTime.utc().startOf('minute').unix() * 1000 - 1,
            limit,
            interval: "1m"
        }

        let url = baseUrl + apiGetKlines;

        axios.get(url, {
                params: reqData
            })
            .then((res) => {
                if (oldNumberofRequestPerMinute > numberOfRequestPerMinute) {
                    numberOfRequestPerMinute++;
                }
                log.info(`${res.data.length} candles of ${this.asset}/${this.currency} from ${startTime.utc().format("YYYY-MM-DD HH:mm:ss")} to ${endTime.utc().format("YYYY-MM-DD HH:mm:ss")}`)
                resolve(this._processData(res.data));
            })
            .catch(async err => {
                if (oldNumberofRequestPerMinute > numberOfRequestPerMinute) {
                    numberOfRequestPerMinute++;
                }
                if (err.response) {
                    log.info(numberOfRequestPerMinute);
                    log.info(err.response);
                    // Vượt ngưỡng và sắp bị ban
                    if(
                        // err.response.status == 418 
                        // || err.response.status == 429 
                        // || err.response.status == 403 //
                        (parseInt(err.response.status) >= 400 && parseInt(err.response.status) < 500)
                        ) {
                        // bắt các cặp khác cùng chờ
                        numberOfRequestPerMinute = numberLimitRequestPerMinuteOfBinace;
                        await utils.wait(5*60*1000);
                    } else {
                    // Lỗi
                        return reject(new Error(err.response.data.msg));
                    }
                } else {
                    // Có thể là do rớt mạng
                    log.info('' + err);
                    await utils.wait(1000);
                }
                resolve(await this.getCandles(startTime, endTime));
            })
    })
}

/**
 * @param {Object} startTime - Moment, không cách quá 12h
 */
Binance.prototype.getNewestCandles = function (startTime) {
    return this.getCandles(startTime, moment(new Date()));
}

Binance.prototype._processData = (data) => {
    return _.map(data, _candle => {
        let candle = {};
        for (let i = 0; i < key_Value.length; i++) {
            candle[key_Value[i]] = parseFloat(_candle[i]);
        }
        return candle;
    })
}

module.exports = Binance;