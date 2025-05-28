const express = require('express');
const crypto = require('crypto');
const app = express();

const WEBHOOK_SECRET = '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';

app.get('/health', (req, res) => {
  res.json({ status: 'OK', time: new Date().toISOString() });
});

function verifyWebhook(rawBody, hmacHeader) {
  const digest = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(rawBody, 'utf8')
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(digest, 'base64'),
    Buffer.from(hmacHeader, 'base64')
  );
}

app.post('/webhooks/orders/create', express.raw({ type: 'application/json' }), (req, res) => {
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
  const rawBody = req.body.toString();

  console.log('Raw body:', rawBody);
  console.log('Headers:', req.headers);


  const order = JSON.parse(rawBody);
  console.log('✅ Order received:', order.id, order.name);

  res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
