const express = require('express');
const crypto = require('crypto');

const app = express();
const PORT = 3000;
const SHOPIFY_WEBHOOK_SECRET = 'f536de0f97bf86cfa1a0625b403c5ef80a94fb40ac48de3dc212318ab5585601'; 

app.use(express.json({ type: 'application/json' }));

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.post('/webhooks/orders/cancelled', (req, res) => {
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
  const body = JSON.stringify(req.body);

  const digest = crypto
    .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
    .update(body, 'utf8')
    .digest('base64');

  if (digest === hmacHeader) {
    console.log('✅ Verified webhook');
    const orderData = req.body;
    console.log('🚫 Order Cancelled:', orderData);
    res.status(200).send('Webhook received');
  } else {
    console.warn('❌ Webhook verification failed');
    res.status(401).send('Unauthorized');
  }
});

app.listen(PORT, () => {
  console.log(`Webhook server running at http://localhost:${PORT}`);
});
