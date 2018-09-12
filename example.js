var Buda = require('./buda');

var publicBuda = new Buda();

//publicBuda.ticker('btc-clp').then(function(result) { console.log(result) });
//publicBuda.order_book('btc-clp').then(function(result) { console.log(result) });
//publicBuda.trades('btc-clp',1528768062310).then(function(result) { console.log(result) });
//publicBuda.markets().then(function(result) { console.log(result) });
//publicBuda.fees('btc', 'deposit').then(function(result) { console.log(result) });
//publicBuda.get_quotation('btc-clp', 'bid_given_earned_base', 0.01).then(function(result) { console.log(result) });

var api_key = 'your-key';
var api_secret = 'your-secret';
var privateBuda = new Buda(api_key, api_secret);

//    commented out for your protection

//privateBuda.balance('clp').then(function(result) { console.log(result) });
//privateBuda.order_pages('btc-clp').then(function(result) { console.log(result) });
//privateBuda.new_order("btc-clp", "bid", "limit", 835875, 0.05).then(function(result) { console.log(result) }); //Parameter missing
//privateBuda.cancel_order(3262406).then(function(result) { console.log(result) });
//privateBuda.single_order(588).then(function(result) { console.log(result) });
//privateBuda.deposits('clp').then(function(result) { console.log(result) });
//privateBuda.withdrawals('clp').then(function(result) { console.log(result) });
//privateBuda.withdrawal('btc',2.5,'mo366JJaDU5B1hmnPygyjQVMbUKnBC7DsY').then(function(result) { console.log(result) });  //Parameter missing
//privateBuda.new_fiat_deposit('CLP', 250000).then(function(result) { console.log(result) });  //Parameter missing
//privateBuda.new_crypto_address('BTC').then(function(result) { console.log(result) });
//privateBuda.get_address('BTC',30216).then(function(result) { console.log(result) });
