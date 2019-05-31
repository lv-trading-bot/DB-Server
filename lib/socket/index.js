const io = require('socket.io-client');
const utils = require('../../utils');
const log = require('../../log');
const fs = require('fs');

const type = 'system';

let randomId = null;

try {
    randomId = JSON.parse(fs.readFileSync('./id.store')).id;
} catch (error) {
    randomId = `${(new Date()).getTime()}_${Math.random()}`;
}

fs.writeFileSync('./id.store', JSON.stringify({id: randomId}));

let socket;

const connect = () => {
    socket = io.connect(utils.getConfig().LIVE_TRADING_MANAGER_BASE_URL);
    log.info(utils.getConfig().LIVE_TRADING_MANAGER_BASE_URL)

    socket.on("connect", () => {
        log.info('Connect to live trading manager successfully!');
        socket.emit("onConnect", type, randomId, {
            name: "DB_SERVER"
        });
    })

    socket.on('connect_error', function () {
        log.warn('Cannot connect socket to ', utils.getConfig().LIVE_TRADING_MANAGER_BASE_URL);
    });

    // socket.on(chanel, (data) => {
    //     handler(data);
    // })
}

const disconnect = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

module.exports = {
    connect,
    disconnect
}