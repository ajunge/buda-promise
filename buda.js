var querystring = require("querystring");
var requestPromise = require('request-promise');
var _ = require('underscore');
var CryptoJS = require('crypto-js');
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

Buda.prototype._request = function(method, path, data, args, auth=false) {
    var options = {
      uri: 'https://www.buda.com' + path,
      method: method,
      headers: {
        'User-Agent': 'Mozilla/4.0 (compatible; buda-promise Node.js client)'
      },
      timeout: 5000,
      resolveWithFullResponse: true,
    };
  
    //Maybe if data!==null
    if (method === 'post') {
      options.form = data;
    }
  
    if(auth){
        var authHeader=this._authHeader(method,path, data)
        options.headers =Object.assign(options.headers, authHeader);
    }

    console.log(options);

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

  Buda.prototype._authHeader = function(method, path, body){
    var nonce = this._generateNonce();
    var message;
    if(body){
      var rawBody=JSON.stringify(body)
      var base64_encoded_body=Buffer.from(rawBody).toString('base64')
      message=method+' '+this.endpoint+uri+' '+base64_encoded_body+' '+nonce
    }else{
      message=method.toUpperCase()+' '+path+' '+nonce
    }

    var signature=CryptoJS.HmacSHA384(message, this.api_secret).toString();

    return {
        'X-SBTC-APIKEY': this.api_key,
        'X-SBTC-NONCE': nonce,
        'X-SBTC-SIGNATURE': signature
    };

  }

  
  Buda.prototype._get = function(endpoint, args, auth=false) {
    args = _.compactObject(args);
  
    var path = '/api/v2' + endpoint;
  
    path += (querystring.stringify(args) === '' ? '' : '?') + querystring.stringify(args);
    console.log(path)
    return this._request('get', path, undefined, args, auth)
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
  
    args = _.compactObject(args);
    var data = querystring.stringify(args);
  
    return this._request('post', path, data, args);
  }
  
//
// Public API
//

Buda.prototype.ticker = function(market) {
    return this._get('/markets/'+market+'/ticker');
}

Buda.prototype.order_book = function(market) {
    return this._get('/markets/'+market+'/order_book');
}

Buda.prototype.trades = function(market, timestamp) {
    return this._get('/markets/'+market+'/trades', {timestamp: timestamp});
}

Buda.prototype.markets = function() {
    return this._get('/markets');
}

//
// Private API
// (you need to have key / secret / client ID set)
//

Buda.prototype.balances = function(currency) {
  var curr='';
  if(currency) curr='/'+currency;
    return this._get('/balances'+curr, null, true);
}



module.exports = Buda;