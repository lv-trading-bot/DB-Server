# DB-Server
- Sync dữ liệu từ Market
- Lưu trữ dữ liệu của nhiều đồng, nhiều sàn
- Hỗ trợ api để query

# api 
## 1. `{GET}/candles`
- input:
```
{
    "market_info": {
        "exchange": "binance",
        "currency": "USDT",
        "asset": "BTC"
    },
    "candle_size": 60,
    "from": "2018-10-01T00:00:00.000Z" (milliseconds/ISO 8601),
    "to": "2018-10-05T01:00:00.000Z",
    "features": ["start","open","high","low","close","volume","trades",{
        	"name": "omlbct",
        	"params": {
        		"takeProfit": 2,
        		"stopLoss": -10,
        		"expirationPeriod": 24
        	}
        }
    ]
}
```
- output: 
```
[
    {
        "start": 1538352000000,
        "open": 6626.57,
        "high": 6656.8,
        "low": 6620.77,
        "close": 6647.88,
        "volume": 1068.1931970000003,
        "trades": 5896,
        "omlbct": 0
    },
    {
        "start": 1538355600000,
        "open": 6648.92,
        "high": 6667.09,
        "low": 6629.51,
        "close": 6637.85,
        "volume": 1026.0028660000003,
        "trades": 5910,
        "omlbct": 0
    }
]
```
# Lưu ý
- Các biến ENV:
    - `MONGO_URL`: connection string
    - `LIVE_TRADING_MANAGER_BASE_URL`: Địa chỉ của con live_manager
    - `ID`: Id để bắn sang live_manager để định danh