const express = require('express');
var braintree = require("braintree");
const url = require('url');
var bodyParser = require('body-parser');
const { Transaction } = require('braintree');

const app = express()
const port = 3000

app.use('/resources', express.static('resources'));

var urlencodedParser = bodyParser.urlencoded({ extended: false })
var merchantAccountID;

var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: '69wmcf9jh5t7pwhq',
  publicKey: '9g6qq4vs6nvd7xxr',
  privateKey: 'b5bce0eded0da20cefb7d3ed275b9eb7'
});

app.post("/set_environment", urlencodedParser, function (req, res){ 
    merchantAccountID = req.body.merchantAccountID
});

app.get("/set_shipping", function(req, res){
  const queryObject = url.parse(req.url,true).query;
});

app.get('/',function(req,res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/flex', function (req, res) {
  merchantAccountID = "LUCIA-GBP"
  res.sendFile(__dirname + '/flex.html')
})

app.get('/credit', function (req, res) {
  merchantAccountID = "LUCIA-CREDIT"
  res.sendFile(__dirname + '/credit.html')
})

app.get('/ECM', function (req, res) {
  merchantAccountID = "LUCIA-GBP"
  res.sendFile(__dirname + '/ECM.html')
})

app.get('/ECS', function (req, res) {
  merchantAccountID = "LUCIA-GBP"
  res.sendFile(__dirname + '/ECS.html')
})

app.get('/hostedFields', function (req, res) {
  merchantAccountID = "LUCIA-GBP"
  res.sendFile(__dirname + '/hostedFields.html')
})

app.get("/client_token", function (req, res) {
  gateway.clientToken.generate({
    merchantAccountId: merchantAccountID
  }, function (err, response) {
    res.send(response.clientToken);  
  });
});

app.post("/checkout", urlencodedParser, function (req, res) {
  var saleRequest = {
    amount: req.body.amount,
    merchantAccountId: merchantAccountID,
    paymentMethodNonce: req.body.nonce,
    orderId: req.body.orderID,
    shipping: {
      firstName: req.body.recipientName,
      lastName: req.body.recipientName,
      streetAddress: req.body.line1,
      extendedAddress: req.body.line2,
      locality: req.body.city,
      region: req.body.region,
      postalCode: req.body.postalCode,
      countryCodeAlpha2: req.body.countryCode,
    },
    options: {
      submitForSettlement: true,
      paypal: {
        customField: "PayPal custom field",
        description: "Description for PayPal email receipt",
      },
    }
  };

console.log("SALE REQUEST INCOMING...");  
console.log(saleRequest);

  gateway.transaction.sale(saleRequest, function (err, result) {
    if (err) {
      res.send("<h1>Error:  " + err + "</h1>");
      console.log("ERROR 1");
      console.log(result.message);
    } else if (result.success) {
      res.send("<h1>Success! Transaction ID: " + result.transaction.id + "</h1>");
      console.log("SUCCESS");
    } else {
      res.send("<h1>Error:  " + result.message + "</h1>");
      console.log("ERROR 2");
      console.log(result.message);
    }
  });
  // Use payment method nonce here
});

app.post("/cardCheckout", urlencodedParser, function (req, res) {

  gateway.transaction.sale({
    amount: "10",
    paymentMethodNonce: req.body.nonce,
  }, function (err, result) {
    if (err) {
      res.send("<h1>Error:  " + err + "</h1>");
      console.log("ERROR 1");
      console.log(result.message);
    } else if (result.success) {
      res.send("<h1>Success! Transaction ID: " + result.transaction.id + "</h1>");
      console.log("SUCCESS");
    } else {
      res.send("<h1>Error:  " + result.message + "</h1>");
      console.log("ERROR 2");
      console.log(result.message);
    }
  });
  // Use payment method nonce here
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});