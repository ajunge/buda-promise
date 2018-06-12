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

var Buda = function(api_key, api_secret) {
  this.api_key = api_key;
  this.api_secret = api_secret;

  _.bindAll.apply(_, [this].concat(_.functions(this)));
}

Buda.prototype._request = function(method, path, data, args) {
    var options = {
      uri: 'https://www.buda.com' + path,
      method: method,
      headers: {
        'User-Agent': 'Mozilla/4.0 (compatible; buda-promise Node.js client)'
      },
      timeout: 5000,
      resolveWithFullResponse: true,
    };
  
    if (method === 'post') {
      options.form = data;
    }
  
    return requestPromise(options)
      .then(function(res) {
        return JSON.parse(res.body);
      }).catch(function(err) {
        let message;
        if (err.name === 'StatusCodeError') {
          message = 'Buda error ' + err.statusCode + ': ' + (err.statusCode === 404 ? 'Not found' : err.response.body);
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
  
  Buda.prototype._get = function(market, action, args) {
    args = _.compactObject(args);
  
    if(market)
      var path = '/api/v2/markets/' + market + '/' + action;
    else
      var path = '/api/v2/' + action;
  
    path += (querystring.stringify(args) === '' ? '' : '?') + querystring.stringify(args);
    console.log(path)
    return this._request('get', path, undefined, args)
  }
  
  Buda.prototype._post = function(market, action, args, legacy_endpoint) {
    if(!this.key || !this.secret || !this.client_id)
      return Promise.reject('Must provide api_key and api_secret to make this API request.');
  
    if(legacy_endpoint)
      var path = '/api/' + action + '/';
    else {
      if(market)
        var path = '/api/v2/' + action + '/' + market + '/';
      else
        var path = '/api/v2/' + action + '/';
    }
  
    var nonce = this._generateNonce();
    var message = nonce + this.client_id + this.key;
    var signer = crypto.createHmac('sha256', new Buffer(this.secret, 'utf8'));
    var signature = signer.update(message).digest('hex').toUpperCase();
  
    args = _.extend({
      key: this.key,
      signature: signature,
      nonce: nonce
    }, args);
  
    args = _.compactObject(args);
    var data = querystring.stringify(args);
  
    return this._request('post', path, data, args);
  }
  
  //
  // Public API
  //
  
  Buda.prototype.ticker = function(market) {
    return this._get(market, 'ticker');
  }
  
  Buda.prototype.order_book = function(market) {
    return this._get(market, 'order_book');
  }

  Buda.prototype.trades = function(market, timestamp) {
    return this._get(market, 'trades', {timestamp: timestamp});
  }

  Buda.prototype.markets = function() {
    return this._get(null, 'markets');
  }

  module.exports = Buda;