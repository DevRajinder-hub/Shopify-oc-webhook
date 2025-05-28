const express = require('express');
const crypto = require('crypto');
const app = express();

// Middleware
app.use('/webhooks', express.raw({ type: 'application/json' }));
app.use(express.json());

// Webhook secret - your actual secret from Shopify
const WEBHOOK_SECRET = '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';

// Verify webhook authenticity
function verifyWebhook(data, hmacHeader) {
  const calculatedHmac = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(data, 'utf8')
    .digest('base64');
  
  return crypto.timingSafeEqual(
    Buffer.from(calculatedHmac, 'base64'),
    Buffer.from(hmacHeader, 'base64')
  );
}

// Order create webhook
app.post('/webhooks/orders/create', (req, res) => {
  try {
    const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
    
    // Verify webhook
    if (!verifyWebhook(req.body, hmacHeader)) {
      return res.status(401).send('Unauthorized');
    }
    
    const order = JSON.parse(req.body.toString());
    
    // Log essential order data
    console.log('🛍️ NEW ORDER RECEIVED:');
    console.log('Order ID:', order.id);
    console.log('Order Name:', order.name);
    console.log('Customer Email:', order.email);
    console.log('Total Price:', order.total_price);
    console.log('Currency:', order.currency);
    console.log('Financial Status:', order.financial_status);
    console.log('Order Note:', order.note || 'No note');
    
    // Customer info
    if (order.customer) {
      console.log('Customer:', order.customer.first_name, order.customer.last_name);
    }
    
    // Products ordered
    console.log('Items:');
    order.line_items?.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.title} - Qty: ${item.quantity} - Price: ${item.price}`);
    });
    
    // Shipping address
    if (order.shipping_address) {
      console.log('Ship to:', 
        order.shipping_address.address1, 
        order.shipping_address.city, 
        order.shipping_address.country
      );
    }
    
    console.log('-------------------');
    
    // Process order (add your logic here)
    processOrder(order);
    
    res.status(200).send('OK');
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error');
  }
});

// Your custom order processing
function processOrder(order) {
  // Add your business logic here
  console.log(`Processing order ${order.name}...`);
  
  // Examples:
  // - Save to database
  // - Send email notifications
  // - Update inventory
  // - Call external APIs
  
  console.log('Order processed successfully!');
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', time: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Webhook URL: http://localhost:${PORT}/webhooks/orders/create`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
