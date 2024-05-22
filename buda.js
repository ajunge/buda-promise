var querystring = require("querystring");
var requestPromise = require('request-promise');
var _ = require('underscore');
var crypto = require('crypto');
var Promise = require('bluebird');

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

var Buda = function(api_key, api_secret, base_url='https://www.buda.com') {
  this.api_key = api_key;
  this.api_secret = api_secret;
  this.base_url = base_url;

  _.bindAll.apply(_, [this].concat(_.functions(this)));
}

Buda.prototype._request = function(method, path, args, data, auth=false) {
  var fullPath = path + (querystring.stringify(args) === '' ? '' : '?') + querystring.stringify(args);

  var options = {
    uri: this.base_url + fullPath,
    method: method,
    headers: {
      'User-Agent': 'Mozilla/4.0 (compatible; buda-promise Node.js client)',
      'Content-Type': 'application/json'
    },
    timeout: 5000,
    resolveWithFullResponse: true,
    json: true
  };

  if (data) {
    options.body = data;
  }

  if(auth){
    if(!this.api_key || !this.api_secret)
      return Promise.reject('Must provide api_key and api_secret to make this API request.');

    var authHeader=this._authHeader(method,fullPath, data)
    options.headers =Object.assign(options.headers, authHeader);
  }

  //console.log(options)

  return requestPromise(options)
    .then(function(res) {
      return res.body;
    }).catch(function(err) {
      let message;
      if (err.name === 'StatusCodeError') {
        message = 'Buda error ' + err.statusCode + ': ' + (err.statusCode === 404 ? 'Not found' : JSON.stringify(err.response.body));
      } else {
        message = 'Buda error: ' + err.message;
      }
      throw new Error(message);
    });
  }

  // if you call new Date to fast it will generate
  // the same ms, helper to make sure the nonce is
  // truly unique (supports up to 999 calls per ms).
  Buda.prototype._generateNonce = function() {
    var now = new Date().getTime();

    if(now !== this.last)
      this.nonceIncr = -1;

    this.last = now;
    this.nonceIncr++;

    // add padding to nonce incr
    // @link https://stackoverflow.com/questions/6823592/numbers-in-the-form-of-001
    var padding =
      this.nonceIncr < 10 ? '000' :
        this.nonceIncr < 100 ? '00' :
          this.nonceIncr < 1000 ?  '0' : '';
    return now + padding + this.nonceIncr;
  }

  Buda.prototype._authHeader = function(method, path, body){
    var nonce = this._generateNonce();
    var message;
    if(body){
      var base64_encoded_body=Buffer.from(JSON.stringify(body)).toString('base64')
      message=method+' '+path+' '+base64_encoded_body+' '+nonce
    }else{
      message=method+' '+path+' '+nonce
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
  return this._request('GET','/api/v2/markets/'+market+'/ticker');
}

// https://api.buda.com/#order-book
Buda.prototype.order_book = function(market) {
  return this._request('GET','/api/v2/markets/'+market+'/order_book');
}

// https://api.buda.com/#trades
Buda.prototype.trades = function(market, timestamp) {
  return this._request('GET','/api/v2/markets/'+market+'/trades',{timestamp: timestamp});
}

// https://api.buda.com/#markets
Buda.prototype.markets = function() {
  return this._request('GET','/api/v2/markets');
}

// https://api.buda.com/#costos-de-abonos-retiros
Buda.prototype.fees = function(currency, type) {
  return this._request('GET',`/api/v2/currencies/${currency}/fees/${type}`)
}

// https://api.buda.com/#cotizaciones
Buda.prototype.get_quotation = function(market, type, amount, limit) {
  var payload = { 
    type: type,
    amount: amount,
    limit: limit
  };
  var url =  '/api/v2/markets/'+market+'/quotations';

  return this._request('POST',url,null,payload,true);
};


//
// Private API
// (you need to have api_key / api_secret)
//

// Undocumented
Buda.prototype.me = function() {
  return this._request('GET','/api/v2/me',null,null,true);
}

// https://api.buda.com/#balances
Buda.prototype.balance = function(currency) {
  var curr='';
  if(currency) curr='/'+currency;
  return this._request('GET','/api/v2/balances'+curr,null,null,true);
}

// https://api.buda.com/#mis-rdenes
Buda.prototype.order_pages = function(market, per, page, state) {
  var args={
    per: per,
    page: page,
    state: state
  }
  return this._request('GET','/api/v2/markets/'+market+'/orders',args,null,true);
}

// https://api.buda.com/#nueva-orden
Buda.prototype.new_order = function(market, type, price_type, limit, amount) {
  var payload={
    order: {
      type: type,
      price_type: price_type,
      limit: limit,
      amount: amount
    }
  }
  return this._request('POST','/api/v2/markets/'+market+'/orders',null,payload,true);
}

// https://api.buda.com/#cancelar-orden
Buda.prototype.cancel_order = function(order_id) {
  var payload={
    state: "canceling"
  }
  return this._request('PUT','/api/v2/orders/'+order_id,null,payload,true);
}

// https://api.buda.com/#rest-api-llamadas-privadas-cancelar-todas-mis-ordenes
Buda.prototype.cancel_orders = function(market, type) {
	var payload={
    market: market,
    type: type
  }
  return this._request('DELETE','/api/v2/orders',null,payload,true);
}

// https://api.buda.com/#estado-de-la-orden
Buda.prototype.single_order = function(order_id) {
  return this._request('GET','/api/v2/orders/'+order_id,null,null,true);

}

// https://api.buda.com/#lote-de-ordenes
Buda.prototype.batch_orders = function(diff) {
  var payload={
    diff: diff
  }
  return this._request('POST','/api/v2/orders',null,payload,true);
}

// https://api.buda.com/#historial-de-depositos-retiros
Buda.prototype.deposits = function(currency, per, page, state) {
  var args={
    per: per,
    page: page,
    state: state,
  }

  return this._request('GET','/api/v2/currencies/'+currency+'/deposits',args,null,true);
}
Buda.prototype.withdrawals = function(currency, per, page, state) {
  var args={
    per: per,
    page: page,
    state: state,
  }

  return this._request('GET','/api/v2/currencies/'+currency+'/withdrawals',args,null,true);
}

// https://api.buda.com/#nuevo-retiro
Buda.prototype.withdrawal = function(currency, amount, target_address, simulate) {
  var payload={
    amount: amount,
    currency: currency,
    simulate: simulate || false,
    withdrawal_data: {
      target_address: target_address
    }
  }
  return this._request('POST','/api/v2/currencies/'+currency+'/withdrawals',null,payload,true);
}

// https://api.buda.com/#nuevo-retiro-lightning
Buda.prototype.lightning_withdrawal = function(amount, invoice, simulate) {
  var payload={
    amount: amount,
    withdrawal_data: {
      payment_request: invoice,
    },
    simulate: simulate || false,
  }
  return this._request('POST','/api/v2/reserves/ln-btc/withdrawals',null,payload,true);
}

// https://api.buda.com/#nuevo-abono-lightning
Buda.prototype.lightning_network_invoices = function(amount, currency, memo, expiry_seconds) {
  var payload={
    amount_satoshis: amount,
    currency: currency,
    memo: memo,
    expiry_seconds: expiry_seconds || false
  }
  return this._request('POST','/api/v2/lightning_network_invoices',null,payload,true);
}

// https://api.buda.com/#dep-sito-dinero-fiat
Buda.prototype.new_fiat_deposit = function(currency, amount, simulate) {
  var payload={
    amount: amount,
    simulate: simulate || false
  }
  return this._request('POST','/api/v2/currencies/'+currency+'/deposits',null,payload,true);
}

// https://api.buda.com/#dep-sito-criptomonedas
Buda.prototype.new_crypto_address = function(currency) {
  return this._request('POST','/api/v2/currencies/'+currency+'/receive_addresses',null,null,true);
}
Buda.prototype.get_address = function(currency, address_id) {
  var addr='';
  if(address_id) addr='/'+address_id;
  return this._request('GET','/api/v2/currencies/'+currency+'/receive_addresses'+addr,null,null,true);
}

module.exports = Buda;
