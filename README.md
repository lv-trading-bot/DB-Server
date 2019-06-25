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
    - `AUTHENTICATION_TOKEN`: Biến môi trường dùng cho việc authenticate
- Thời gian bắt đầu `sync (beginAt)` phải tránh nằm trong khoảng `DOWNTIME` của sàn.
# Các đặc trưng (features) hỗ trợ kèm theo 1 candle
Các đặc trưng khi truyền vào tham số "features" có thể ở dạng chuỗi hoặc object với 2 trường `name` và `params`. Nếu đặc trưng truyền vào ở dạng chuỗi, các tham số mặc định sẽ được sử dụng trong quá trình xây dựng đặc trưng đó.
- start: thời gian bắt đầu
- open: giá mở
- high: giá cao nhất
- low: giá thấp nhất
- close: giá đóng
- volume: khối lượng giao dịch
- trades: số lượng giao dịch
- hour: giờ trong ngày
- MACD: Moving Average Convergence Divergence
  - ```
    {
        name: "MACD",
        params: {
            short: 12,
            long: 26,
            signal: 9
        }
    }
    ```
- RSI: Relative Strength Index
  - ```
    {
        name: "RSI",
        params: {
            interval: 14
        }
    }
    ```
- ADX: Average Directional Index
  - ```
    {
        name: "ADX",
        params: {
            period: 14
        }
    }
    ```