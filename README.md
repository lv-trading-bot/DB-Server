# DB-Server
- Sync dữ liệu từ Market
- Lưu trữ dữ liệu của nhiều đồng, nhiều sàn
- Hỗ trợ api để query

# api 
## 1. `{GET}/candles`
- input:
```
    {
        market_info: {
            exchange: "binance",
            currency: "USDT",
            asset: "BTC"
        },
        candle_size: 60,
        from: 123123123213 #(millisecond),
        to: 1232114345 #(millisecond) (EXCLUSIVE),
        features: ["start", "open", "close", "action", "volume"]
    }
```
- output: 
```
    [
        {
            start: 12321321,
            open: 123,
            close: 452,
            action: 1,
            volume: 12365
        }
    ]
```
