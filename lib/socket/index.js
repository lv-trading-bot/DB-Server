const io = require('socket.io-client');
const utils = require('../../utils');

const type = 'system';

let socket;

const connect = () => {
    socket = io.connect(utils.getConfig().LIVE_TRADING_MANAGER_BASE_URL);

    socket.on("connect", () => {
      socket.emit("onConnect", type, `${(new Date()).getTime()}_${Math.random()}`, {
          name: "DB_SERVER"
      });
    })
  
    // socket.on(chanel, (data) => {
    //     handler(data);
    // })
}

const disconnect = () => {
    if(socket) {
        socket.disconnect();
        socket = null;
    }
}

module.exports = {
    connect,
    disconnect
}