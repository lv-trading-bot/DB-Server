const MongoClient = require('mongodb').MongoClient;
const log = require('../../log');
const ObjectId = require('mongodb').ObjectId;
const utils = require('../../utils');

/**
 * @param {string} connectionString - connection string
 * @param {sting} dbName - database name
 */
const MongoDb = function ({connectionString, dbName}) {
    this.connectionString = connectionString;
    this.dbName = dbName;
    this.db = null;
    this._init()
}

MongoDb.prototype._init = async function () {
    try {
        this.db = (await MongoClient.connect(this.connectionString, { useNewUrlParser: true })).db(this.dbName);
        log.info("Connected successfully to mongodb server");
    }
    catch (err) {
        throw err;
    }
}

/**
 * @param {string} exchange - name of exchange
 * @param {string} asset - name of Asset
 * @param {string} currency - name of Currency
 * @param {Object[]} candles - candles
 */
MongoDb.prototype.write = function (exchange, asset, currency, candles) {
    return new Promise(async (resolve, reject) => {
        if (!this.db) {
            await utils.wait(1000);
            resolve(await this.write(exchange, asset, currency, candles));
            return;
        }
        // db ready to write data
        try {
            let collectionName = utils.generateCollectionName(exchange, asset, currency);
            if(candles.length !== 0) {
                insertDocuments(this.db, collectionName, candles, (err, res) => {
                    if (err) reject(err);
                    resolve(res);
                })
            } else {
                resolve();
            }
        } catch (err) {
            reject(err);
        }
    })
}

/**
 * @param {string} exchange - name of exchange
 * @param {string} asset - name of Asset
 * @param {string} currency - name of Currency
 * @param {Object} from - Moment Object
 * @param {Object} to - Moment Object 
 */
MongoDb.prototype.readCandles = function (exchange, asset, currency, from, to) {
    return new Promise(async (resolve, reject) => {
        if (!this.db) {
            await utils.wait(1000);
            resolve(await this.readCandles(exchange, asset, currency, from, to));
            return;
        }
        // Get the documents collection
        const collection = this.db.collection(utils.generateCollectionName(exchange, asset, currency));
        // Find some documents
        try {
            const unixOfFrom = from.utc().unix()*1000;
            const unixOfTo = to.utc().unix()*1000;
            collection.aggregate([
                {$match: {start: {$gte: unixOfFrom, $lt: unixOfTo}}},
                {$sort: {start: 1}}
            ]).toArray((err, res) => {
                if (err) reject(err);
                resolve(res);
            })
        } catch (err) {
            reject(err);
        }
    })
}

/**
 * @param {string} exchange - name of exchange
 * @param {string} asset - name of Asset
 * @param {string} currency - name of Currency
 * @param {string} id - id of document
 */
MongoDb.prototype.removeCandle = function (exchange, asset, currency, id) {
    return new Promise(async (resolve, reject) => {
        if (!this.db) {
            await utils.wait(1000);
            resolve(await this.removeCandle(exchange, asset, currency, id));
            return;
        }
        // Get the documents collection
        const collection = this.db.collection(utils.generateCollectionName(exchange, asset, currency));
        // Find some documents
        try {
            collection.deleteOne({"_id": ObjectId(id)}, (err, res) => {
                if(err) reject(err);
                else resolve(res);
            })
        } catch (err) {
            reject(err);
        }
    })
}

/**
 * @param {string} exchange - name exchange
 * @param {string} asset - name of Asset
 * @param {string} currency - name of Currency
 * @param {Number} n - N candle latest want to get
 */
MongoDb.prototype.readNLatestCandles = function (exchange, asset, currency, n) {
    return new Promise(async (resolve, reject) => {
        if (!this.db) {
            await utils.wait(1000);
            resolve(await this.readNLatestCandles(exchange, asset, currency, n));
            return;
        }
        // Get the documents collection
        const collection = this.db.collection(utils.generateCollectionName(exchange, asset, currency));
        // Find some documents
        try {
            collection.aggregate([
                { $sort: { start: -1 } },
                { $limit: n }
            ]).toArray((err, res) => {
                if (err) reject(err);
                resolve(res);
            })
        } catch (err) {
            reject(err);
        }
    })
}

/**
 * @param {string} exchange - name exchange
 * @param {string} asset - name of Asset
 * @param {string} currency - name of Currency
 */
MongoDb.prototype.createIndex = function (exchange, asset, currency) {
    return new Promise(async (resolve, reject) => {
        if (!this.db) {
            await utils.wait(1000);
            resolve(await this.createIndex(exchange, asset, currency));
            return;
        }
        // Get the documents collection
        const collection = this.db.collection(utils.generateCollectionName(exchange, asset, currency));
        // Find some documents
        try {
            indexCollection(this.db, collection);
        } catch (err) {
           
        }
        resolve();
    })
}

/**
 * 
 * @param {Object} db 
 * @param {string} collection 
 */
const indexCollection = function (db, collection) {
    db.collection(collection).createIndex({ "start": -1 });
};

/**
 * 
 * @param {Object} db 
 * @param {string} collectionName 
 * @param {Object[]} candles 
 * @param {Function} callback 
 */
const insertDocuments = function (db, collectionName, candles, callback) {
    // Get the documents collection
    const collection = db.collection(collectionName);
    // Insert some documents
    collection.insertMany(candles, callback);
}

module.exports = MongoDb;