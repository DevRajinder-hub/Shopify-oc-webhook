const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const SHOPIFY_WEBHOOK_SECRET = 'f536de0f97bf86cfa1a0625b403c5ef80a94fb40ac48de3dc212318ab5585601';

// Middleware to save raw body buffer for webhook verification
app.use('/webhooks/orders/cancelled', bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.post('/webhooks/orders/cancelled', (req, res) => {
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
  const rawBody = req.rawBody;

  // Calculate HMAC using raw body buffer
  const digest = crypto
    .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
    .update(rawBody, 'utf8')
    .digest('base64');

  if (digest === hmacHeader) {
    console.log('✅ Verified webhook');
    console.log('🚫 Order Cancelled:', req.body);
    res.status(200).send('Webhook received');
  } else {
    console.warn('❌ Webhook verification failed');
    res.status(401).send('Unauthorized');
  }
});

app.listen(PORT, () => {
  console.log(`Webhook server running at http://localhost:${PORT}`);
});
