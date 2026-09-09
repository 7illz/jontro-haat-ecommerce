const sendEmail = require('../utils/sendEmail');

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const sendOrderConfirmation = async (order, customerEmail) => {
  const itemLines = order.orderItems
    .map((item) => `<li>${item.qty}x ${escapeHtml(item.name)} - ৳${(item.price * item.qty).toFixed(2)}</li>`)
    .join('');

  await sendEmail({
    email: customerEmail,
    subject: `Order Confirmation ${order._id}`,
    html: `
      <h1>Thank you for your order!</h1>
      <p>Your order has been received. Payment status: pending.</p>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Total:</strong> ৳${order.totalPrice.toFixed(2)}</p>
      <hr />
      <h3>Order Items:</h3>
      <ul>${itemLines}</ul>
      <p>We will notify you when it ships.</p>
    `,
  });
};

module.exports = { sendOrderConfirmation };
