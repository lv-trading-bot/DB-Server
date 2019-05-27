var config = {};

config.beginAt = "2019-04-09T00:00:00.000Z";

config.pairs = [
    {
        exchange: "binance",
        currency: "USDT",
        asset: "BTC",
    },
    {
        exchange: "binance",
        currency: "USDT",
        asset: "ETH",
    },
    {
        exchange: "binance",
        currency: "USDT",
        asset: "LTC",
    },{
        exchange: "binance",
        currency: "USDT",
        asset: "BNB",
    }
]

config.adapterDatabase = "mongo";
config.mongo = {
    connectionString: process.env.MONGO_URL,
    dbName:  "db_candles_of_cryptocurrency_docker"
}

config.LIVE_TRADING_MANAGER_BASE_URL = process.env.LIVE_TRADING_MANAGER_BASE_URL || "http://localhost:3001";

config.debug = true;
config.silent = false;

config.production = true;
config.loggerAdapter = 'file';

module.exports = config;