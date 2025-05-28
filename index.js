const express = require('express');
const crypto = require('crypto');
const app = express();

// Shopify Webhook Secret
const WEBHOOK_SECRET = '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';

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', time: new Date().toISOString() });
});

// Verify webhook
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

// Webhook route — USE RAW middleware ONLY here!
app.post('/webhooks/orders/create', express.raw({ type: 'application/json' }), (req, res) => {
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
  const rawBody = req.body.toString();

  // Debug log (you can remove this later)
  console.log('Raw body:', rawBody);
  console.log('Headers:', req.headers);

  // Verify webhook
  if (!verifyWebhook(rawBody, hmacHeader)) {
    console.log('❌ Invalid HMAC!');
    return res.status(401).send('Unauthorized');
  }

  const order = JSON.parse(rawBody);
  console.log('✅ Order received:', order.id, order.name);

  // Process order here
  res.status(200).send('OK');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
