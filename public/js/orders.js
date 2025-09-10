function filterOrders(status) {
  const orders = document.querySelectorAll('.order-card');
  orders.forEach((order) => {
    if (status === 'all' || order.dataset.status === status) {
      order.style.display = 'block';
    } else {
      order.style.display = 'none';
    }
  });
}

function trackPackage(orderId) {
  alert(
    `Tracking package for order: ${orderId}\n\nStatus: In Transit\nExpected delivery: March 22, 2024\nCarrier: UPS`,
  );
}

function returnItems(orderId) {
  alert(
    `Starting return process for order: ${orderId}\n\nYou can return eligible items within 30 days of delivery.`,
  );
}

function buyAgain(product) {
  alert(`Adding ${product} to your cart...`);
}

function writeReview(product) {
  alert(`Opening review form for ${product}...`);
}

function cancelOrder(orderId) {
  if (confirm(`Are you sure you want to cancel items in order ${orderId}?`)) {
    alert(`Cancellation request submitted for order ${orderId}`);
  }
}
