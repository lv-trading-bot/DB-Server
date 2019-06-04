const moment = require('moment');
const _ = require('lodash');
const log = require('../log');
const utils = require('../utils');
const config = utils.getConfig();
const TICK = 1; // minute

const beginAt = config.beginAt;
const pairs = config.pairs;
const adapterDatabase = config.adapterDatabase;
const configOfDatabase = config[adapterDatabase];
const Database = new(require('./database/' + adapterDatabase))(configOfDatabase);

const runProcessForOnePair = async (exchangeName, asset, currency, beginAt, database) => {
    const Exchange = new(require('./exchanges/' + exchangeName))(asset, currency);
    // Đánh index
    await Database.createIndex(exchangeName, asset, currency);

    // Sync dữ liệu lịch sử
    log.info(`Begin sync history candle for ${asset}/${currency}`);
    let latestCandle = await syncHistoryCandle(Exchange, exchangeName, asset, currency, beginAt, database);

    // Sync dữ liệu mới
    log.info(`Begin sync realtime candle for ${asset}/${currency}`);
    await syncRealtimeCandle(Exchange, exchangeName, asset, currency, beginAt, database, latestCandle);
}

const syncRealtimeCandle = async (Exchange, exchangeName, asset, currency, beginAt, database, _latestCandle) => {
    let latestCandle = null;
    if (_latestCandle) {
        latestCandle = _latestCandle;
    } else {
        let res = await database.readNLatestCandles(exchangeName, asset, currency, 1)
        latestCandle = res[0];
    }
    return new Promise((resolve, reject) => {
        //force to tick at the first second of a minute 
        setTimeout(() => {
            let interval = setInterval(async () => {
                let res = await syncPairWithTime(
                    Exchange,
                    exchangeName,
                    asset,
                    currency,
                    moment(latestCandle.start).add(1, 'm').startOf('minute'),
                    moment().startOf('minute'),
                    database);
                latestCandle = res ? res : latestCandle;
            }, TICK * 60 * 1000)
        }, (60 - parseInt(moment().second()) + 1) * 1000)
    })
}

const syncHistoryCandle = (Exchange, exchangeName, asset, currency, beginAt, database) => {
    let latestCandle = null;
    return new Promise(async (resolve, reject) => {
        // Kiểm tra các đoạn còn thiếu
        let iterator = {
            start: moment.utc(beginAt).startOf('minute'),
            end: moment.utc(beginAt).startOf('minute').add(24, 'h')
        }

        let isChecking = true;
        while (isChecking) {
            // Chia đoạn lớn thành những đoạn nhỏ để kiểm tra
            // Nếu vượt quá tương hiện tại thì gán bằng hiện tại
            if (iterator.end.utc().isAfter(moment.utc().startOf('minute'))) {
                iterator.end = moment().utc().startOf('minute');
                isChecking = false;
            }
            try {
                let dataCandlesWillCheck = await database.readCandles(exchangeName, asset, currency, iterator.start, iterator.end);
                let lastCandle = null;
                let dateRangeWasLost = {
                    start: null,
                    end: null
                }
                for (let i = 0; i < dataCandlesWillCheck.length; i++) {
                    let curCandle = dataCandlesWillCheck[i];
                    if (lastCandle) {
                        let startOfLastCandle = moment.utc(lastCandle.start);
                        let startOfCurCandle = moment.utc(curCandle.start);
                        // Kiểm tra nếu candle trước và candle sau trùng nhau thì xóa bớt 1 candle sau
                        if (lastCandle.start === curCandle.start) {
                            log.info(`${asset}/${currency}: candle ${startOfLastCandle.utc().format("YYYY-MM-DD HH:mm")} duplicate, remove one`);
                            await database.removeCandle(exchangeName, asset, currency, curCandle._id)
                            continue;
                        }
                        // Nếu hợp lệ
                        else if (startOfLastCandle.utc().clone().add(1, 'm').isSame(startOfCurCandle)) {
                            // Nếu trước đó có đoạn chưa hợp lệ thì đóng đoạn và sync
                            if (dateRangeWasLost.start) {
                                dateRangeWasLost.end = startOfLastCandle.utc().clone();
                                // Sync lại đoạn còn thiếu
                                latestCandle = await syncPairWithTime(
                                    Exchange,
                                    exchangeName,
                                    asset,
                                    currency,
                                    dateRangeWasLost.start,
                                    dateRangeWasLost.end,
                                    database);
                                // Reset
                                dateRangeWasLost = {
                                    start: null,
                                    end: null
                                }
                            }
                        } else {
                            // Nếu không hợp lệ thì bắt đầu mở đoạn, hoặc đã mở đoạn rồi thì bỏ qua
                            if (!dateRangeWasLost.start) {
                                dateRangeWasLost.start = startOfLastCandle.clone().add(1, 'm');
                            }
                        }
                    }
                    lastCandle = curCandle;
                }

                // Kiểm tra đoạn trên đã được thêm đầy đủ chưa
                if (lastCandle) {
                    // Nếu candle cuối cùng không trùng với điểm kết thúc thì sync từ candle cuối cùng đến điểm kết thúc
                    if (!moment(lastCandle.start).isSame(iterator.end.clone().subtract(1, 'm'))) {
                        latestCandle = await syncPairWithTime(
                            Exchange,
                            exchangeName,
                            asset,
                            currency,
                            moment(lastCandle.start).add(1, 'm'),
                            iterator.end,
                            database);
                    }
                } else {
                    // Đoạn trống nên import hết đoạn
                    latestCandle = await syncPairWithTime(
                        Exchange,
                        exchangeName,
                        asset,
                        currency,
                        iterator.start,
                        iterator.end,
                        database);
                }
            } catch (err) {
                reject(err);
            }

            // Tăng biến chạy để kiểm tra đoạn tiếp theo
            iterator.start = iterator.end.clone();
            iterator.end = iterator.start.clone().startOf('minute').add(24, 'h');
        }
        resolve(latestCandle);
    })
}

const syncPairWithTime = (exchange, exchangeName, asset, currency, beginAt, endAt, database) => {
    return new Promise(async (resolve, reject) => {
        // Khởi tạo biến chạy
        let iterator = {
            start: moment(beginAt).startOf('minute'),
            end: moment(beginAt).startOf('minute').add(1, 'h')
        }

        let isSync = true;
        let lastCandle = null;
        while (isSync) {
            // Nếu vượt quá tương hiện tại thì gán bằng hiện tại
            if (iterator.end.isAfter(moment(endAt).startOf('minute'))) {
                iterator.end = moment(endAt).startOf('minute');
                isSync = false;
            }
            try {
                let candleFromExchange = await exchange.getCandles(iterator.start, iterator.end);

                candleFromExchange = await tranformToValidDateRange(exchange, exchangeName, asset, currency, iterator.start, iterator.end, database, candleFromExchange, lastCandle);

                if (candleFromExchange.length !== 0) {
                    await database.write(exchangeName, asset, currency, candleFromExchange);
                }
                lastCandle = candleFromExchange[candleFromExchange.length - 1];
            } catch (err) {
                reject(err);
            }

            // Tăng biến chạy để kiểm tra đoạn tiếp theo
            iterator.start = moment(iterator.end.unix() * 1000 + 1);
            iterator.end = iterator.start.clone().add(1, 'h');
        }
        resolve(lastCandle);
    })
}

const tranformToValidDateRange = (exchange, exchangeName, asset, currency, beginAt, endAt, database, candleFromExchange, previousCandle) => {
    return new Promise(async (resolve, reject) => {
        // Check các candle bị thiếu do sàn trả về k có để bổ sung cho đầy đủ
        let total = endAt.diff(beginAt, 'minute');

        // Kiểm tra xem có đủ tổng số candle không?
        if (candleFromExchange.length < total) {
            let indexCandles = 0;
            let newCandleFromExchange = [];
            for(let i = 0; i < total; i++) {
                let start = beginAt.valueOf() + i * 60 * 1000;

                // Hợp lệ
                if(candleFromExchange[indexCandles] && start == candleFromExchange[indexCandles].start) {
                    newCandleFromExchange.push(candleFromExchange[indexCandles]);
                    indexCandles++;
                } else {
                // Không hợp lệ
                    // Đoạn đầu, lấy previous candle
                    if(i === 0) {
                        // Không có previousCandle phải query từ db
                        if(!previousCandle) {
                            let _candle = await database.readCandles(exchangeName, asset, currency, start - (60 * 1000), start - 1);
                            if(_candle[0]) {
                                newCandleFromExchange.push({
                                    "start" : start,
                                    "open" : _candle[0].close,
                                    "high" : _candle[0].close,
                                    "low" : _candle[0].close,
                                    "close" : _candle[0].close,
                                    "volume" : 0,
                                    "end_time" : start + (60 * 1000) - 1,
                                    "quote_asset_volume" : 0,
                                    "trades" : 0,
                                    "taker_buy_base_asset_volume" : 0,
                                    "taker_buy_quote_asset_volume" : 0,
                                    "ignore" : "0"
                                });
                            } else {
                                newCandleFromExchange.push({
                                    "start" : start,
                                    "open" : 0,
                                    "high" : 0,
                                    "low" : 0,
                                    "close" : 0,
                                    "volume" : 0,
                                    "end_time" : start + (60 * 1000) - 1,
                                    "quote_asset_volume" : 0,
                                    "trades" : 0,
                                    "taker_buy_base_asset_volume" : 0,
                                    "taker_buy_quote_asset_volume" : 0,
                                    "ignore" : "0"
                                });
                            }
                        } else {
                            newCandleFromExchange.push({
                                "start" : start,
                                "open" : previousCandle.close,
                                "high" : previousCandle.close,
                                "low" : previousCandle.close,
                                "close" : previousCandle.close,
                                "volume" : 0,
                                "end_time" : start + (60 * 1000) - 1,
                                "quote_asset_volume" : 0,
                                "trades" : 0,
                                "taker_buy_base_asset_volume" : 0,
                                "taker_buy_quote_asset_volume" : 0,
                                "ignore" : "0"
                            });
                        }
                    } else {
                        newCandleFromExchange.push({
                            "start" : start,
                            "open" : newCandleFromExchange[i - 1].close,
                            "high" : newCandleFromExchange[i - 1].close,
                            "low" : newCandleFromExchange[i - 1].close,
                            "close" : newCandleFromExchange[i - 1].close,
                            "volume" : 0,
                            "end_time" : start + (60 * 1000) - 1,
                            "quote_asset_volume" : 0,
                            "trades" : 0,
                            "taker_buy_base_asset_volume" : 0,
                            "taker_buy_quote_asset_volume" : 0,
                            "ignore" : "0"
                        });
                    }
                }
            }
            resolve(newCandleFromExchange);
        } else {
            resolve(candleFromExchange);
        }
    })
}

// Chạy tất cả các pair
_.each(pairs, pair => {
    log.info(`Begin sync ${pair.asset}/${pair.currency} from ${moment(beginAt).utc().format("YYYY-MM-DD HH:mm")} from ${pair.exchange}`)
    runProcessForOnePair(pair.exchange, pair.asset, pair.currency, beginAt, Database);
})