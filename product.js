const CART_KEY = "wrognCart";
const COMMENTS_KEY = "wrognComments";
const params = new URLSearchParams(window.location.search);
const productId = Number(params.get("id"));
const product = products.find((item) => item.id === productId);
const productImage = document.getElementById("productImage");
const productCategory = document.getElementById("productCategory");
const productTitle = document.getElementById("productTitle");
const productRating = document.getElementById("productRating");
const productBadge = document.getElementById("productBadge");
const productDescription = document.getElementById("productDescription");
const productPrice = document.getElementById("productPrice");
const productOldPrice = document.getElementById("productOldPrice");
const productTags = document.getElementById("productTags");
const sizeOptions = document.getElementById("sizeOptions");
const colorOptions = document.getElementById("colorOptions");
const detailsList = document.getElementById("detailsList");
const reviewsList = document.getElementById("reviewsList");
const commentInput = document.getElementById("commentInput");
const commentSubmit = document.getElementById("commentSubmit");
const commentsList = document.getElementById("commentsList");
const productAddButton = document.getElementById("productAddButton");

let selectedSize = null;
let selectedColor = null;

function formatPrice(value) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function loadCart() {
  const stored = localStorage.getItem(CART_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function loadComments() {
  const stored = localStorage.getItem(COMMENTS_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveComments(comments) {
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
}

function addToCart(productId, size, color) {
  const cart = loadCart();
  const existing = cart.find((item) => item.id === productId && item.size === size && item.color === color);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, size, color, quantity: 1 });
  }
  saveCart(cart);
}

function renderSizes() {
  sizeOptions.innerHTML = "";
  if (!product.sizes) return;

  product.sizes.forEach((size) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "size-chip";
    button.textContent = size;
    if (!selectedSize) {
      selectedSize = product.sizes[0];
      button.classList.add("active");
    }
    if (size === selectedSize) {
      button.classList.add("active");
    }
    button.addEventListener("click", () => {
      selectedSize = size;
      document.querySelectorAll(".size-chip").forEach((chip) => chip.classList.remove("active"));
      button.classList.add("active");
    });
    sizeOptions.appendChild(button);
  });
}

function renderColors() {
  colorOptions.innerHTML = "";
  if (!product.colors || product.colors.length === 0) return;

  product.colors.forEach((color) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "color-chip";
    button.textContent = color;
    if (!selectedColor) {
      selectedColor = product.colors[0];
    }
    if (color === selectedColor) {
      button.classList.add("active");
    }
    button.addEventListener("click", () => {
      selectedColor = color;
      document.querySelectorAll(".color-chip").forEach((chip) => chip.classList.remove("active"));
      button.classList.add("active");
    });
    colorOptions.appendChild(button);
  });
}

function renderDetails() {
  detailsList.innerHTML = "";
  if (!product.details) return;
  product.details.forEach((detail) => {
    const li = document.createElement("li");
    li.textContent = detail;
    detailsList.appendChild(li);
  });
}

function renderReviews() {
  reviewsList.innerHTML = "";
  if (!product.reviews || product.reviews.length === 0) {
    reviewsList.innerHTML = "<p class='muted-text'>No reviews yet.</p>";
    return;
  }
  product.reviews.forEach((review) => {
    const reviewCard = document.createElement("div");
    reviewCard.className = "review-card";
    reviewCard.innerHTML = `
      <div class="review-meta">
        <strong>${review.user}</strong>
        <span>${review.date}</span>
      </div>
      <div class="rating">★ ${review.rating}</div>
      <p>${review.comment}</p>
    `;
    reviewsList.appendChild(reviewCard);
  });
}

function renderComments() {
  commentsList.innerHTML = "";
  const comments = loadComments();
  const productComments = comments[productId] || [];
  if (productComments.length === 0) {
    commentsList.innerHTML = "<p class='muted-text'>No comments yet. Be the first to leave feedback.</p>";
    return;
  }
  productComments.slice().reverse().forEach((comment) => {
    const node = document.createElement("div");
    node.className = "comment-card";
    node.innerHTML = `
      <div class="comment-meta">
        <span>${comment.user}</span>
        <span>${comment.date}</span>
      </div>
      <p>${comment.text}</p>
    `;
    commentsList.appendChild(node);
  });
}

function addComment(text) {
  const comments = loadComments();
  const productComments = comments[productId] || [];
  productComments.push({
    user: "Guest",
    text,
    date: new Date().toLocaleDateString("en-IN"),
  });
  comments[productId] = productComments;
  saveComments(comments);
  renderComments();
}

function renderProductDetails() {
  if (!product) {
    document.body.innerHTML = `<div class="page-shell"><h1 style="color:#fff;">Product not found</h1><p style="color:#bbb;">Please go back to the shop.</p></div>`;
    return;
  }

  productImage.src = product.image;
  productImage.alt = product.title;
  productCategory.textContent = product.category;
  productTitle.textContent = product.title;
  productRating.textContent = `★ ${product.rating.toFixed(1)}`;
  productBadge.textContent = product.badge || "";
  productBadge.style.display = product.badge ? "inline-flex" : "none";
  productDescription.textContent = product.description || "Premium streetwear staple with a modern, comfortable fit.";
  productPrice.textContent = formatPrice(product.price);
  productOldPrice.textContent = formatPrice(product.originalPrice);
  productTags.innerHTML = product.tags.map((tag) => `<span class="tag">${tag}</span>`).join("");

  selectedSize = null;
  selectedColor = null;
  renderSizes();
  renderColors();
  renderDetails();
  renderReviews();
  renderComments();
}

productAddButton.addEventListener("click", () => {
  if (!product) return;
  addToCart(product.id, selectedSize, selectedColor);
  productAddButton.textContent = "ADDED";
  productAddButton.style.opacity = "0.85";
  setTimeout(() => {
    productAddButton.textContent = "ADD TO BAG";
    productAddButton.style.opacity = "1";
  }, 900);
});

commentSubmit.addEventListener("click", () => {
  const text = commentInput.value.trim();
  if (!text) return;
  addComment(text);
  commentInput.value = "";
});

renderProductDetails();