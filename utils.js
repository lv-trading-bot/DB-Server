var utils = {};

/**
 * @param {Number} milisecond 
 */
utils.wait = (milisecond) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, milisecond);
    })
}

/**
 * @param {string} exchange - name of exchange
 * @param {string} asset - name of Asset
 * @param {string} currency - name of Currency
 */
utils.generateCollectionName = (exchange, asset, currency) => {
    return [exchange, asset, currency].join("");
}

module.exports = utils;