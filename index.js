'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const config = require('./config/index.js')
const JSONParseError = require('@line/bot-sdk').JSONParseError
const SignatureValidationFailed = require('@line/bot-sdk').SignatureValidationFailed
// create LINE SDK config from env variables


// create LINE SDK client
const configLine  = {
    channelAccessToken: '1VLJBEIdrxS7KvCCvi8bUx4ErCP0+IWiC8FcrUHsW+KfPE+Q7l+oup6VC6G3zbEcVvginI0reBQIScicFOkQbcT1uNqW3oWP7d2U2qU14DxRnJeJKki0H9y4eE+6NxENMk8jmhYsUcitgmAq9kzCJwdB04t89/1O/w1cDnyilFU=',
    channelSecret: '3fb4bf26118374e7f241d739189d2e07'
}

const client = new line.Client(configLine);
// create Express app
// about Express itself: https://expressjs.com/
const app = express();

app.post('/hello', (req, res) => {
  res.json({})
})
// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(configLine), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

app.use((err, req, res, next) => {
  if (err instanceof SignatureValidationFailed) {
    res.status(401).send(err.signature)
    return
  } else if (err instanceof JSONParseError) {
    res.status(400).send(err.raw)
    return
  }
  next(err) // will throw default 500
})
// event handler
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  // create a echoing text message
  const echo = { type: 'text', text: event.message.text };

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
