var querystring = require("querystring");
var axios = require('axios');
var _ = require('underscore');
var crypto = require('crypto');

_.mixin({
  // compact for objects
  compactObject: function(to_clean) {
    _.map(to_clean, function(value, key, to_clean) {
      if (value === undefined)
        delete to_clean[key];
    });
    return to_clean;
  }
});

var Buda = function(api_key, api_secret, options) {
  if (typeof options === 'string') {
    // backwards compatibility: 3rd param used to be base_url string
    this.base_url = options;
    this.timeout = 5000;
  } else {
    options = options || {};
    this.base_url = options.base_url || 'https://www.buda.com';
    this.timeout = options.timeout || 5000;
  }
  this.api_key = api_key;
  this.api_secret = api_secret;

  _.bindAll.apply(_, [this].concat(_.functions(this)));
}

Buda.prototype._request = function(method, path, args, data, auth) {
  var fullPath = path + (querystring.stringify(args) === '' ? '' : '?') + querystring.stringify(args);

  var options = {
    url: this.base_url + fullPath,
    method: method,
    headers: {
      'User-Agent': 'Mozilla/4.0 (compatible; buda-promise Node.js client)',
      'Content-Type': 'application/json'
    },
    timeout: this.timeout
  };

  if (data) {
    options.data = data;
  }

  if (auth) {
    if (!this.api_key || !this.api_secret)
      return Promise.reject(new Error('Must provide api_key and api_secret to make this API request.'));

    var authHeader = this._authHeader(method, fullPath, data);
    options.headers = Object.assign(options.headers, authHeader);
  }

  return axios(options)
    .then(function(res) {
      return res.data;
    }).catch(function(err) {
      let message;
      if (err.response) {
        message = 'Buda error ' + err.response.status + ': ' + (err.response.status === 404 ? 'Not found' : JSON.stringify(err.response.data));
      } else {
        message = 'Buda error: ' + err.message;
      }
      throw new Error(message);
    });
}

// if you call new Date too fast it will generate
// the same ms, helper to make sure the nonce is
// truly unique (supports up to 999 calls per ms).
Buda.prototype._generateNonce = function() {
  var now = new Date().getTime();

  if (now !== this.last)
    this.nonceIncr = -1;

  this.last = now;
  this.nonceIncr++;

  // add padding to nonce incr
  // @link https://stackoverflow.com/questions/6823592/numbers-in-the-form-of-001
  var padding =
    this.nonceIncr < 10 ? '000' :
      this.nonceIncr < 100 ? '00' :
        this.nonceIncr < 1000 ? '0' : '';
  return now + padding + this.nonceIncr;
}

Buda.prototype._authHeader = function(method, path, body) {
  var nonce = this._generateNonce();
  var message;
  if (body) {
    var base64_encoded_body = Buffer.from(JSON.stringify(body)).toString('base64');
    message = method + ' ' + path + ' ' + base64_encoded_body + ' ' + nonce;
  } else {
    message = method + ' ' + path + ' ' + nonce;
  }
  var signature = crypto.createHmac('sha384', this.api_secret).update(message).digest('hex');

  return {
    'X-SBTC-APIKEY': this.api_key,
    'X-SBTC-NONCE': nonce,
    'X-SBTC-SIGNATURE': signature
  };
}

//
// Public API
//

// https://api.buda.com/#ticker
Buda.prototype.ticker = function(market) {
  return this._request('GET', '/api/v2/markets/' + market + '/ticker');
}

// https://api.buda.com/#tickers
Buda.prototype.tickers = function() {
  return this._request('GET', '/api/v2/tickers');
}

// https://api.buda.com/#order-book
Buda.prototype.order_book = function(market) {
  return this._request('GET', '/api/v2/markets/' + market + '/order_book');
}

// https://api.buda.com/#rest-api-llamadas-publicas-volumen-transado
Buda.prototype.volume = function(market) {
  return this._request('GET', '/api/v2/markets/' + market + '/volume');
}

// https://api.buda.com/#trades
Buda.prototype.trades = function(market, timestamp, limit) {
  var payload = {
    timestamp: timestamp,
    limit: limit
  };
  return this._request('GET', '/api/v2/markets/' + market + '/trades', payload);
}

// https://api.buda.com/#markets
Buda.prototype.markets = function() {
  return this._request('GET', '/api/v2/markets');
}

// https://api.buda.com/#detalle-de-mercado
Buda.prototype.market = function(market) {
  return this._request('GET', '/api/v2/markets/' + market);
}

// https://api.buda.com/#costos-de-abonos-retiros
Buda.prototype.fees = function(currency, type) {
  return this._request('GET', `/api/v2/currencies/${currency}/fees/${type}`);
}

// https://api.buda.com/#cotizaciones
Buda.prototype.get_quotation = function(market, type, amount, limit) {
  var payload = {
    type: type,
    amount: amount,
    limit: limit
  };
  var url = '/api/v2/markets/' + market + '/quotations';

  return this._request('POST', url, null, payload, true);
};


//
// Private API
// (you need to have api_key / api_secret)
//

// Undocumented
Buda.prototype.me = function() {
  return this._request('GET', '/api/v2/me', null, null, true);
}

// https://api.buda.com/#balances
Buda.prototype.balance = function(currency) {
  var curr = '';
  if (currency) curr = '/' + currency;
  return this._request('GET', '/api/v2/balances' + curr, null, null, true);
}

// https://api.buda.com/#mis-rdenes
Buda.prototype.order_pages = function(market, per, page, state) {
  var args = {
    per: per,
    page: page,
    state: state
  }
  return this._request('GET', '/api/v2/markets/' + market + '/orders', args, null, true);
}

// https://api.buda.com/#nueva-orden
Buda.prototype.new_order = function(market, type, price_type, limit, amount, client_id) {
  var payload = {
    order: _.compactObject({
      type: type,
      price_type: price_type,
      limit: limit,
      amount: amount,
      client_id: client_id
    })
  }
  return this._request('POST', '/api/v2/markets/' + market + '/orders', null, payload, true);
}

// https://api.buda.com/#cancelar-orden
Buda.prototype.cancel_order = function(order_id) {
  var payload = {
    state: "canceling"
  }
  return this._request('PUT', '/api/v2/orders/' + order_id, null, payload, true);
}

// https://api.buda.com/#rest-api-llamadas-privadas-cancelar-todas-mis-ordenes
Buda.prototype.cancel_orders = function(market, type) {
  var payload = {
    market: market,
    type: type
  }
  return this._request('DELETE', '/api/v2/orders', null, payload, true);
}

// https://api.buda.com/#estado-de-la-orden
Buda.prototype.single_order = function(order_id) {
  return this._request('GET', '/api/v2/orders/' + order_id, null, null, true);
}

// https://api.buda.com/#lote-de-ordenes
Buda.prototype.batch_orders = function(diff) {
  var payload = {
    diff: diff
  }
  return this._request('POST', '/api/v2/orders', null, payload, true);
}

// https://api.buda.com/#orden-por-client-id
Buda.prototype.order_by_client_id = function(client_id) {
  return this._request('GET', '/api/v2/orders/by-client-id/' + client_id, null, null, true);
}

// https://api.buda.com/#cancelar-orden-por-client-id
Buda.prototype.cancel_order_by_client_id = function(client_id) {
  var payload = {
    state: "canceling"
  }
  return this._request('PUT', '/api/v2/orders/by-client-id/' + client_id, null, payload, true);
}

// https://api.buda.com/#historial-de-depositos-retiros
Buda.prototype.deposits = function(currency, per, page, state) {
  var args = {
    per: per,
    page: page,
    state: state,
  }

  return this._request('GET', '/api/v2/currencies/' + currency + '/deposits', args, null, true);
}
Buda.prototype.withdrawals = function(currency, per, page, state) {
  var args = {
    per: per,
    page: page,
    state: state,
  }

  return this._request('GET', '/api/v2/currencies/' + currency + '/withdrawals', args, null, true);
}

// https://api.buda.com/#nuevo-retiro
Buda.prototype.new_crypto_withdrawal = function(currency, amount, target_address, simulate) {
  var payload = {
    amount: amount,
    currency: currency,
    simulate: simulate || false,
    withdrawal_data: {
      target_address: target_address
    }
  }
  return this._request('POST', '/api/v2/currencies/' + currency + '/withdrawals', null, payload, true);
}

// https://api.buda.com/#retiro-dinero-fiat
Buda.prototype.new_fiat_withdrawal = function(currency, amount, simulate) {
  var payload = {
    amount: amount,
    simulate: simulate || false
  }
  return this._request('POST', '/api/v2/currencies/' + currency + '/withdrawals', null, payload, true);
}

// https://api.buda.com/#nuevo-retiro-lightning
Buda.prototype.lightning_withdrawal = function(amount, invoice, simulate) {
  var payload = {
    amount: amount,
    withdrawal_data: {
      payment_request: invoice,
    },
    simulate: simulate || false,
  }
  return this._request('POST', '/api/v2/reserves/ln-btc/withdrawals', null, payload, true);
}

// https://api.buda.com/#nuevo-abono-lightning
Buda.prototype.lightning_network_invoices = function(amount, currency, memo, expiry_seconds) {
  var payload = {
    amount_satoshis: amount,
    currency: currency,
    memo: memo,
    expiry_seconds: expiry_seconds || false
  }
  return this._request('POST', '/api/v2/lightning_network_invoices', null, payload, true);
}

// https://api.buda.com/#dep-sito-dinero-fiat
Buda.prototype.new_fiat_deposit = function(currency, amount, simulate) {
  var payload = {
    amount: amount,
    simulate: simulate || false
  }
  return this._request('POST', '/api/v2/currencies/' + currency + '/deposits', null, payload, true);
}

// https://api.buda.com/#dep-sito-criptomonedas
Buda.prototype.new_crypto_address = function(currency) {
  return this._request('POST', '/api/v2/currencies/' + currency + '/receive_addresses', null, null, true);
}
Buda.prototype.get_address = function(currency, address_id) {
  var addr = '';
  if (address_id) addr = '/' + address_id;
  return this._request('GET', '/api/v2/currencies/' + currency + '/receive_addresses' + addr, null, null, true);
}

//
// Cross Border Payments API
//

// https://api.buda.com/#nueva-remesa
Buda.prototype.quote_remittance = function(params) {
  var payload = {
    origin_amount: params.origin_amount,
    destination_amount: params.destination_amount,
    origin_currency: params.origin_currency,
    destination_currency: params.destination_currency,
    client_reference_id: params.client_reference_id,
    recipient_data: params.recipient_data
  }
  return this._request('POST', '/api/v2/remittances', null, _.compactObject(payload), true);
}

// https://api.buda.com/#aceptar-remesa
Buda.prototype.accept_remittance = function(remittance_id) {
  return this._request('POST', '/api/v2/remittances/' + remittance_id + '/accept', null, null, true);
}

// https://api.buda.com/#detalle-de-remesa
Buda.prototype.remittance = function(remittance_id) {
  return this._request('GET', '/api/v2/remittances/' + remittance_id, null, null, true);
}

// https://api.buda.com/#listar-remesas
Buda.prototype.remittances = function(per, page) {
  var args = {
    per: per,
    page: page
  }
  return this._request('GET', '/api/v2/remittances', args, null, true);
}

// https://api.buda.com/#listar-destinatarios
Buda.prototype.remittance_recipients = function(per, page) {
  var args = {
    per: per,
    page: page
  }
  return this._request('GET', '/api/v2/remittance_recipients', args, null, true);
}

// https://api.buda.com/#detalle-de-destinatario
Buda.prototype.remittance_recipient = function(recipient_id) {
  return this._request('GET', '/api/v2/remittance_recipients/' + recipient_id, null, null, true);
}

module.exports = Buda;
