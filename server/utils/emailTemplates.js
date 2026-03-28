const { sendEmail } = require('./email');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://coffee-shop-ten-psi.vercel.app';

// --- Shared layout wrapper ---

function buildEmail(title, bodyContent) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAF6F1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
  <div style="text-align:center;padding:24px 0">
    <h1 style="margin:0;font-size:24px;color:#6F4E37;letter-spacing:1px">Brew Haven</h1>
  </div>
  <div style="background:#FFFFFF;border-radius:12px;padding:32px 24px;border:1px solid #E8DDD3">
    <h2 style="margin:0 0 16px;color:#3E2E1E;font-size:20px">${title}</h2>
    ${bodyContent}
  </div>
  <div style="text-align:center;padding:20px 0;font-size:12px;color:#A08D7D">
    <p style="margin:0 0 4px">Need help? Reply to this email.</p>
    <p style="margin:0">Brew Haven &mdash; Freshly roasted, delivered to your door.</p>
  </div>
</div>
</body>
</html>`;
}

// --- Helpers ---

function itemsTable(items, subtotal, deliveryFee, totalAmount) {
  const rows = items
    .map(
      (i) =>
        `<tr>
      <td style="padding:8px 0;border-bottom:1px solid #F0EBE4;color:#5C4A3A;font-size:14px">${i.name} &times; ${i.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #F0EBE4;color:#5C4A3A;font-size:14px;text-align:right">&#8377;${(i.price * i.quantity).toLocaleString('en-IN')}</td>
    </tr>`
    )
    .join('');

  return `<table style="width:100%;border-collapse:collapse;margin:16px 0">
    ${rows}
    <tr>
      <td style="padding:8px 0;color:#A08D7D;font-size:13px">Subtotal</td>
      <td style="padding:8px 0;color:#A08D7D;font-size:13px;text-align:right">&#8377;${subtotal.toLocaleString('en-IN')}</td>
    </tr>
    <tr>
      <td style="padding:8px 0;color:#A08D7D;font-size:13px">Delivery</td>
      <td style="padding:8px 0;color:#A08D7D;font-size:13px;text-align:right">${deliveryFee === 0 ? 'FREE' : `&#8377;${deliveryFee}`}</td>
    </tr>
    <tr>
      <td style="padding:12px 0 0;font-weight:700;color:#3E2E1E;font-size:16px;border-top:2px solid #E8DDD3">Total</td>
      <td style="padding:12px 0 0;font-weight:700;color:#3E2E1E;font-size:16px;border-top:2px solid #E8DDD3;text-align:right">&#8377;${totalAmount.toLocaleString('en-IN')}</td>
    </tr>
  </table>`;
}

function trackButton(orderId, phone) {
  const url = `${FRONTEND_URL}/track?orderId=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(phone)}`;
  return `<div style="text-align:center;margin:24px 0 8px">
    <a href="${url}" style="display:inline-block;background:#6F4E37;color:#FFFFFF;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px">Track Your Order</a>
  </div>`;
}

function addressBlock(address) {
  return `<div style="background:#FAF6F1;border-radius:8px;padding:16px;margin:16px 0">
    <p style="margin:0;font-size:13px;color:#5C4A3A"><strong>Delivering to:</strong><br>
    ${address.street}<br>
    ${address.city}, ${address.state} &mdash; ${address.pincode}</p>
  </div>`;
}

// --- Email builders ---

function orderConfirmationEmail(order) {
  const body = `
    <p style="margin:0 0 4px;color:#A08D7D;font-size:14px">Order ID: <strong style="color:#6F4E37">${order.orderId}</strong></p>
    <p style="margin:0 0 20px;color:#A08D7D;font-size:14px">Thank you for your purchase, ${order.customer.name}.</p>
    ${itemsTable(order.items, order.subtotal, order.deliveryFee, order.totalAmount)}
    ${addressBlock(order.customer.address)}
    ${trackButton(order.orderId, order.customer.phone)}`;
  return buildEmail('Order Confirmed!', body);
}

const STATUS_CONFIG = {
  processing: {
    subject: (id) => `Order ${id} is Being Prepared`,
    title: 'Your Order is Being Prepared!',
    message: 'We\'re preparing your coffee order. It will be shipped soon.',
  },
  shipped: {
    subject: (id) => `Order ${id} Has Been Shipped`,
    title: 'Your Order Has Been Shipped!',
    message: 'Great news! Your coffee is on its way. You\'ll receive it within 3-5 business days.',
  },
  delivered: {
    subject: (id) => `Order ${id} Delivered — Enjoy Your Coffee!`,
    title: 'Your Order Has Been Delivered!',
    message: 'Your coffee has arrived. We hope you enjoy every sip! Thank you for choosing Brew Haven.',
  },
};

function orderStatusEmail(order, newStatus) {
  const config = STATUS_CONFIG[newStatus];
  if (!config) return null;

  const isDelivered = newStatus === 'delivered';
  const body = `
    <p style="margin:0 0 4px;color:#A08D7D;font-size:14px">Order ID: <strong style="color:#6F4E37">${order.orderId}</strong></p>
    <p style="margin:0 0 20px;color:#5C4A3A;font-size:14px">${config.message}</p>
    ${isDelivered
      ? `<div style="text-align:center;margin:20px 0;font-size:32px">&#9749;</div>
         <div style="text-align:center">
           <a href="${FRONTEND_URL}/products" style="display:inline-block;background:#6F4E37;color:#FFFFFF;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px">Order Again</a>
         </div>`
      : `${addressBlock(order.customer.address)}
         ${trackButton(order.orderId, order.customer.phone)}`
    }`;
  return { subject: config.subject(order.orderId), html: buildEmail(config.title, body) };
}

// --- Public senders (fire-and-forget, never throw) ---

function sendOrderConfirmation(order) {
  const html = orderConfirmationEmail(order);
  sendEmail(order.customer.email, `Order Confirmed — ${order.orderId}`, html);
}

function sendOrderStatusUpdate(order, newStatus) {
  const result = orderStatusEmail(order, newStatus);
  if (result) {
    sendEmail(order.customer.email, result.subject, result.html);
  }
}

module.exports = { sendOrderConfirmation, sendOrderStatusUpdate };
