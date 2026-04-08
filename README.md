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

| Method | API docs |
|--------|----------|
| `buda.markets()` | [Mercados](https://api.buda.com/#rest-api-llamadas-publicas-mercados) |
| `buda.market(market)` | [Mercados](https://api.buda.com/#rest-api-llamadas-publicas-mercados) |
| `buda.ticker(market)` | [Ticker](https://api.buda.com/#rest-api-llamadas-publicas-ticker) |
| `buda.tickers()` | [Todos los Tickers](https://api.buda.com/#rest-api-llamadas-publicas-todos-los-tickers) |
| `buda.order_book(market)` | [Libro de ordenes](https://api.buda.com/#rest-api-llamadas-publicas-libro-de-ordenes) |
| `buda.volume(market)` | [Volumen transado](https://api.buda.com/#rest-api-llamadas-publicas-volumen-transado) |
| `buda.trades(market, timestamp, limit)` | [Trades](https://api.buda.com/#rest-api-llamadas-publicas-trades) |
| `buda.fees(currency, type)` | [Costos de abonos/retiros](https://api.buda.com/#rest-api-llamadas-publicas-costos-de-abonos-retiros) |
| `buda.get_quotation(market, type, amount, limit)` | [Cotizaciones](https://api.buda.com/#rest-api-llamadas-publicas-cotizaciones) |

## Private API

### Account

| Method | API docs |
|--------|----------|
| `buda.me()` | [Informacion personal](https://api.buda.com/#rest-api-llamadas-privadas-informacion-personal) |
| `buda.balance(currency)` | [Balances](https://api.buda.com/#rest-api-llamadas-privadas-balances) |

### Orders

| Method | API docs |
|--------|----------|
| `buda.order_pages(market, per, page, state)` | [Obtener mis ordenes](https://api.buda.com/#rest-api-llamadas-privadas-obtener-mis-ordenes) |
| `buda.new_order(market, type, price_type, limit, amount, client_id)` | [Nueva orden](https://api.buda.com/#rest-api-llamadas-privadas-nueva-orden) |
| `buda.single_order(order_id)` | [Detalle de orden](https://api.buda.com/#rest-api-llamadas-privadas-detalle-de-orden) |
| `buda.order_by_client_id(client_id)` | [Detalle de orden por Client ID](https://api.buda.com/#rest-api-llamadas-privadas-detalle-de-orden-por-client-id) |
| `buda.cancel_order(order_id)` | [Cancelar orden](https://api.buda.com/#rest-api-llamadas-privadas-cancelar-orden) |
| `buda.cancel_order_by_client_id(client_id)` | [Cancelar orden por Client ID](https://api.buda.com/#rest-api-llamadas-privadas-cancelar-orden-por-client-id) |
| `buda.cancel_orders(market, type)` | [Cancelar todas mis ordenes](https://api.buda.com/#rest-api-llamadas-privadas-cancelar-todas-mis-ordenes) |
| `buda.batch_orders(diff)` | [Lote de ordenes](https://api.buda.com/#rest-api-llamadas-privadas-lote-de-ordenes) |

### Deposits & Withdrawals

| Method | API docs |
|--------|----------|
| `buda.deposits(currency, per, page, state)` | [Mis abonos/retiros](https://api.buda.com/#rest-api-llamadas-privadas-mis-abonos-retiros) |
| `buda.withdrawals(currency, per, page, state)` | [Mis abonos/retiros](https://api.buda.com/#rest-api-llamadas-privadas-mis-abonos-retiros) |
| `buda.new_fiat_deposit(currency, amount, simulate)` | [Nuevo abono fiat](https://api.buda.com/#rest-api-llamadas-privadas-nuevo-abono-fiat) |
| `buda.new_fiat_withdrawal(currency, amount, simulate)` | [Nuevo retiro fiat](https://api.buda.com/#rest-api-llamadas-privadas-nuevo-retiro-fiat) |
| `buda.new_crypto_withdrawal(currency, amount, target_address, simulate)` | [Nuevo retiro cripto](https://api.buda.com/#rest-api-llamadas-privadas-nuevo-retiro-cripto) |
| `buda.new_crypto_address(currency)` | [Nuevo abono cripto](https://api.buda.com/#rest-api-llamadas-privadas-nuevo-abono-cripto) |
| `buda.get_address(currency, address_id)` | [Nuevo abono cripto](https://api.buda.com/#rest-api-llamadas-privadas-nuevo-abono-cripto) |

### Lightning Network

| Method | API docs |
|--------|----------|
| `buda.lightning_withdrawal(amount, invoice, simulate)` | [Nuevo retiro lightning](https://api.buda.com/#rest-api-llamadas-privadas-nuevo-retiro-lightning) |
| `buda.lightning_network_invoices(amount, currency, memo, expiry_seconds)` | [Nuevo abono lightning](https://api.buda.com/#rest-api-llamadas-privadas-nuevo-abono-lightning) |

### Cross Border Payments

| Method | API docs |
|--------|----------|
| `buda.quote_remittance(params)` | [Cotizar remesa](https://api.buda.com/#cross-border-payments-cotizar-remesa) |
| `buda.accept_remittance(remittance_id)` | [Aceptar cotizacion](https://api.buda.com/#cross-border-payments-aceptar-cotizacion) |
| `buda.remittance(remittance_id)` | [Consultar remesa](https://api.buda.com/#cross-border-payments-consultar-remesa) |
| `buda.remittances(per, page)` | [Mis remesas](https://api.buda.com/#cross-border-payments-mis-remesas) |
| `buda.remittance_recipients(per, page)` | [Destinatarios de remesas](https://api.buda.com/#cross-border-payments-destinatarios-de-remesas-obtener-todos-los-destinatarios) |
| `buda.remittance_recipient(recipient_id)` | [Destinatario especifico](https://api.buda.com/#cross-border-payments-destinatarios-de-remesas-obtener-un-destinatario-especifico) |

## Related

- [buda-cli](https://www.npmjs.com/package/buda-cli) — command line interface for buda.com built on top of this package

## License

MIT
