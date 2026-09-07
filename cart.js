const CART_KEY = "wrognCart";
const cartItemsContainer = document.getElementById("cartItems");
const cartTotalAmount = document.getElementById("cartTotalAmount");
const clearCartButton = document.getElementById("clearCartButton");
const checkoutButton = document.getElementById("checkoutButton");
const customerNameInput = document.getElementById("customerName");
const customerPhoneInput = document.getElementById("customerPhone");
const customerEmailInput = document.getElementById("customerEmail");
const customerAddressInput = document.getElementById("customerAddress");
const customerCityInput = document.getElementById("customerCity");
const customerZipInput = document.getElementById("customerZip");
const customerNotesInput = document.getElementById("customerNotes");
const paymentMethodSelect = document.getElementById("paymentMethod");
const checkoutError = document.getElementById("checkoutError");
const reviewSummary = document.getElementById("reviewSummary");

function loadCart() {
  const data = localStorage.getItem(CART_KEY);
  return data ? JSON.parse(data) : [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

const ORDERS_KEY = "wrognOrders";

function loadOrders() {
  const data = localStorage.getItem(ORDERS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function gatherCheckoutDetails() {
  return {
    name: customerNameInput.value.trim(),
    phone: customerPhoneInput.value.trim(),
    email: customerEmailInput.value.trim(),
    address: customerAddressInput.value.trim(),
    city: customerCityInput.value.trim(),
    zip: customerZipInput.value.trim(),
    notes: customerNotesInput.value.trim(),
    paymentMethod: paymentMethodSelect.value,
  };
}

function validateCheckoutDetails(details) {
  if (!details.name) return "Please enter your full name.";
  if (!details.phone || details.phone.replace(/\D/g, "").length < 10) return "Please enter a valid phone number.";
  if (!details.address) return "Please enter your shipping address.";
  if (!details.city) return "Please enter your city.";
  if (!details.zip || details.zip.replace(/\D/g, "").length < 4) return "Please enter a valid PIN code.";
  return null;
}

function updateReviewSummary() {
  if (!reviewSummary) return;
  const details = gatherCheckoutDetails();
  const error = validateCheckoutDetails(details);
  if (error) {
    reviewSummary.textContent = error;
    reviewSummary.classList.add("warning");
    return;
  }
  reviewSummary.classList.remove("warning");
  reviewSummary.innerHTML = `
    <p><strong>${details.name}</strong></p>
    <p>${details.address}, ${details.city} - ${details.zip}</p>
    <p>Phone: ${details.phone}</p>
    <p>Payment: ${paymentMethodSelect.options[paymentMethodSelect.selectedIndex].text}</p>
    ${details.notes ? `<p>Notes: ${details.notes}</p>` : ""}
  `;
}

function resetCheckoutForm() {
  customerNameInput.value = "";
  customerPhoneInput.value = "";
  customerEmailInput.value = "";
  customerAddressInput.value = "";
  customerCityInput.value = "";
  customerZipInput.value = "";
  customerNotesInput.value = "";
  paymentMethodSelect.value = "cod";
  checkoutError.textContent = "";
  checkoutError.classList.add("hidden");
  updateReviewSummary();
}

function createOrder(customer) {
  const cart = loadCart();
  if (cart.length === 0) return null;
  const orders = loadOrders();
  const order = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    items: cart,
    customer,
    status: "Order placed",
  };
  orders.push(order);
  saveOrders(orders);
  saveCart([]);
  return order;
}

function getCartProducts() {
  const cart = loadCart();
  if (cart.length === 0) return null;
  const orders = loadOrders();
  const order = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    items: cart,
  };
  orders.push(order);
  saveOrders(orders);
  saveCart([]);
  return order;
}

function getCartProducts() {
  const cart = loadCart();
  return cart
    .map((item) => {
      const product = products.find((product) => product.id === item.id);
      return product ? { ...product, quantity: item.quantity, size: item.size, color: item.color } : null;
    })
    .filter(Boolean);
}

function formatPrice(value) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function updateCart() {
  const cartItems = getCartProducts();
  cartItemsContainer.innerHTML = "";

  if (cartItems.length === 0) {
    cartItemsContainer.innerHTML = `<div class="empty-state">Your cart is empty.</div>`;
    cartTotalAmount.textContent = "₹0";
    checkoutButton.disabled = true;
    checkoutButton.style.opacity = "0.6";
    return;
  }

  checkoutButton.disabled = false;
  checkoutButton.style.opacity = "1";

  cartItems.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="cart-item-media">
        <img src="${item.image}" alt="${item.title}" />
      </div>
      <div class="cart-item-details">
        <h3>${item.title}</h3>
        <span class="tag">${item.category}</span>
        ${item.size ? `<span class="tag">Size: ${item.size}</span>` : ""}
        ${item.color ? `<span class="tag">Color: ${item.color}</span>` : ""}
        <div class="price-row">
          <span class="price-current">${formatPrice(item.price)}</span>
          <span class="price-old">${formatPrice(item.originalPrice)}</span>
        </div>
        <div class="cart-actions-inline">
          <button class="qty-btn" data-action="decrease" data-id="${item.id}" data-size="${item.size || ""}" data-color="${item.color || ""}">-</button>
          <span>${item.quantity}</span>
          <button class="qty-btn" data-action="increase" data-id="${item.id}" data-size="${item.size || ""}" data-color="${item.color || ""}">+</button>
          <button class="text-button remove-btn" data-action="remove" data-id="${item.id}" data-size="${item.size || ""}" data-color="${item.color || ""}">Remove</button>
        </div>
      </div>
    `;

    cartItemsContainer.appendChild(row);
  });

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotalAmount.textContent = formatPrice(total);
}

function updateQuantity(id, delta, size, color) {
  const cart = loadCart();
  const item = cart.find(
    (entry) =>
      entry.id === id &&
      (entry.size || "") === (size || "") &&
      (entry.color || "") === (color || "")
  );
  if (!item) return;
  item.quantity = Math.max(1, item.quantity + delta);
  saveCart(cart);
  updateCart();
}

function removeItem(id, size, color) {
  const cart = loadCart().filter(
    (entry) =>
      !(
        entry.id === id &&
        (entry.size || "") === (size || "") &&
        (entry.color || "") === (color || "")
      )
  );
  saveCart(cart);
  updateCart();
}

cartItemsContainer.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const id = Number(button.dataset.id);
  const size = button.dataset.size || "";
  const color = button.dataset.color || "";
  const action = button.dataset.action;
  if (action === "increase") updateQuantity(id, 1, size, color);
  if (action === "decrease") updateQuantity(id, -1, size, color);
  if (action === "remove") removeItem(id, size, color);
});

clearCartButton.addEventListener("click", () => {
  saveCart([]);
  updateCart();
});

checkoutButton.addEventListener("click", () => {
  const customer = gatherCheckoutDetails();
  const error = validateCheckoutDetails(customer);
  if (error) {
    checkoutError.textContent = error;
    checkoutError.classList.remove("hidden");
    return;
  }
  checkoutError.classList.add("hidden");
  const order = createOrder(customer);
  if (!order) {
    checkoutError.textContent = "Your cart is empty. Add items before placing an order.";
    checkoutError.classList.remove("hidden");
    return;
  }
  updateCart();
  resetCheckoutForm();
  alert(`Order placed successfully. Order #${order.id}`);
});

const checkoutInputs = [
  customerNameInput,
  customerPhoneInput,
  customerEmailInput,
  customerAddressInput,
  customerCityInput,
  customerZipInput,
  customerNotesInput,
];
checkoutInputs.forEach((input) => {
  if (!input) return;
  input.addEventListener("input", updateReviewSummary);
});
paymentMethodSelect?.addEventListener("change", updateReviewSummary);

updateReviewSummary();

updateCart();
