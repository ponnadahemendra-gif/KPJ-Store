const ORDERS_KEY = "wrognOrders";
const ordersList = document.getElementById("ordersList");

function loadOrders() {
  const stored = localStorage.getItem(ORDERS_KEY);
  return stored ? JSON.parse(stored) : [];
}

const trackerLabels = ["Order placed", "Confirmed", "Out for delivery", "Delivered"];

function formatPrice(value) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function getDeliveryStage(order) {
  const elapsed = Date.now() - new Date(order.createdAt).getTime();
  if (elapsed < 1 * 60 * 1000) return 0;
  if (elapsed < 3 * 60 * 1000) return 1;
  if (elapsed < 5 * 60 * 1000) return 2;
  return 3;
}

function renderOrders() {
  const orders = loadOrders();
  ordersList.innerHTML = "";

  if (orders.length === 0) {
    ordersList.innerHTML = `<div class="empty-state">No orders yet. Place your first order from the cart.</div>`;
    return;
  }

  orders
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .forEach((order) => {
      const orderCard = document.createElement("article");
      orderCard.className = "order-card";

      const orderTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const currentStage = getDeliveryStage(order);
      const orderHtml = `
        <div class="order-card-header">
          <div>
            <p class="order-label">Order #${order.id}</p>
            <p class="order-date">${new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div class="order-total">${formatPrice(orderTotal)}</div>
        </div>
        <div class="order-details">
          <p><strong>Customer:</strong> ${order.customer?.name || "Guest"}</p>
          <p><strong>Phone:</strong> ${order.customer?.phone || "-"}</p>
          <p><strong>Address:</strong> ${order.customer?.address || "-"}, ${order.customer?.city || ""} ${order.customer?.zip || ""}</p>
          <p><strong>Payment:</strong> ${order.customer?.paymentMethod ? order.customer.paymentMethod.toUpperCase() : "-"}</p>
        </div>
        <div class="order-card-actions">
          <button class="track-btn" type="button" data-order-id="${order.id}">Track order</button>
        </div>
        <div class="delivery-tracker hidden">
          ${trackerLabels
            .map(
              (label, step) => `
                <div class="tracker-step ${step <= currentStage ? "active" : ""}">
                  <span>${label}</span>
                </div>`
            )
            .join("")}
        </div>
        <div class="order-items">
          ${order.items
            .map((item) => {
              const product = products.find((p) => p.id === item.id);
              if (!product) return "";
              return `
                <div class="order-item">
                  <div class="cart-item-media">
                    <img src="${product.image}" alt="${product.title}" />
                  </div>
                  <div class="order-item-info">
                    <h3>${product.title}</h3>
                    <div class="price-row">
                      <span class="price-current">${formatPrice(product.price)}</span>
                      <span class="tag">Qty: ${item.quantity}</span>
                      ${item.size ? `<span class="tag">Size: ${item.size}</span>` : ""}
                      ${item.color ? `<span class="tag">Color: ${item.color}</span>` : ""}
                    </div>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      `;

      orderCard.innerHTML = orderHtml;
      ordersList.appendChild(orderCard);

      const trackButton = orderCard.querySelector(".track-btn");
      const tracker = orderCard.querySelector(".delivery-tracker");
      if (trackButton && tracker) {
        trackButton.addEventListener("click", () => {
          tracker.classList.toggle("hidden");
          trackButton.textContent = tracker.classList.contains("hidden") ? "Track order" : "Hide tracker";
        });
      }
    });
}

renderOrders();