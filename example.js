var Buda = require('./buda');

var publicBuda = new Buda();

//publicBuda.ticker('btc-clp').then(function(result) { console.log(result) });
//publicBuda.order_book('btc-clp').then(function(result) { console.log(result) });
//publicBuda.trades('btc-clp',1528768062310).then(function(result) { console.log(result) });
publicBuda.markets().then(function(result) { console.log(result) });

var api_key = 'your-key';
var api_secret = 'your-secret';
var privateBuda = new Buda(api_key, api_secret);

//    commented out for your protection

// privateBuda.balance().then(function(result) { console.log(result) });
