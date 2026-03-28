# buda-promise

    npm install buda-promise

A promise-based Node.js wrapper for the [Buda REST API](https://api.buda.com/). Refer to their docs for full parameter details.

```javascript
var Buda = require('buda-promise');

// Public API — no credentials needed
var buda = new Buda();
buda.ticker('btc-clp').then(function(ticks) {
  console.log(ticks);
});

// Private API — requires API key and secret
var buda = new Buda('your-api-key', 'your-api-secret');
buda.balance('clp').then(function(balance) {
  console.log(balance);
});

// Custom timeout (default: 5000ms)
var buda = new Buda('your-api-key', 'your-api-secret', { timeout: 10000 });
```

## Supported Markets

BTC-CLP, BTC-COP, BTC-PEN, BTC-USDC,
ETH-CLP, ETH-COP, ETH-PEN, ETH-BTC,
BCH-CLP, BCH-COP, BCH-PEN, BCH-BTC,
LTC-CLP, LTC-COP, LTC-PEN, LTC-BTC,
USDC-CLP, USDC-COP, USDC-PEN,
USDT-CLP, USDT-COP, USDT-PEN, USDT-USDC,
SOL-CLP, SOL-COP, SOL-PEN

## Public API

```javascript
buda.markets()
buda.ticker(market)
buda.order_book(market)
buda.volume(market)
buda.trades(market, timestamp, limit)
buda.fees(currency, type)
buda.get_quotation(market, type, amount, limit)  // requires auth
```

## Private API

```javascript
// Account
buda.me()
buda.balance(currency)

// Orders
buda.order_pages(market, per, page, state)
buda.new_order(market, type, price_type, limit, amount)
buda.single_order(order_id)
buda.cancel_order(order_id)
buda.cancel_orders(market, type)
buda.batch_orders(diff)

// Deposits & Withdrawals
buda.deposits(currency, per, page, state)
buda.withdrawals(currency, per, page, state)
buda.new_fiat_deposit(currency, amount, simulate)
buda.withdrawal(currency, amount, target_address, simulate)
buda.new_crypto_address(currency)
buda.get_address(currency, address_id)

// Lightning Network
buda.lightning_withdrawal(amount, invoice, simulate)
buda.lightning_network_invoices(amount, currency, memo, expiry_seconds)
```

## License

MIT
