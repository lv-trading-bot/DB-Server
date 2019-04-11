const CandleManager = new (require('../core/candleManager'))();

const postCandles = async (req, res) => {
    res.setHeader("content-type", "text/json");
    let body = req.body;
    let exchange;
    let currency;
    let asset;
    let candleSize;
    let from;
    let to;
    let features;

    try {
        exchange = body.market_info.exchange;
        currency = body.market_info.currency;
        asset = body.market_info.asset;
        candleSize = body.candle_size;
        from = body.from;
        to = body.to;
        features = body.features;

        if(!exchange || !currency || !asset || ! candleSize || !from || !to || !features) {
            throw new Error("Not Enough params.")
        } else {
            res.end(JSON.stringify((await CandleManager.getCandles(exchange, asset, currency, candleSize, from, to, features))));
        }        
    } catch(err) {
        res.end(JSON.stringify({
            code: -1,
            msg: ("" + err)
        }), 400)
    }
}

module.exports.postCandles = postCandles;