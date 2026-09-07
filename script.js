const CART_KEY = "wrognCart";

const state = {
  cartCount: 0,
  searchQuery: "",
  selectedCategories: new Set(),
  priceRange: "all",
  quickFilter: null,
  sortOrder: "featured",
};

function loadCart() {
  const stored = localStorage.getItem(CART_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getCartCount() {
  return loadCart().reduce((total, item) => total + item.quantity, 0);
}

function updateCartCounter() {
  cartCount.textContent = getCartCount();
}

function addToCart(productId) {
  const cart = loadCart();
  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }
  saveCart(cart);
  updateCartCounter();
}


const productsGrid = document.getElementById("productsGrid");
const productCount = document.getElementById("productCount");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const cartCount = document.getElementById("cartCount");
const clearFilters = document.getElementById("clearFilters");
const quickFilters = document.getElementById("quickFilters");
const activeFilters = document.getElementById("activeFilters");

function formatPrice(value) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function applyFilters() {
  let filtered = [...products];

  if (state.searchQuery) {
    const term = state.searchQuery.toLowerCase();
    filtered = filtered.filter((product) =>
      product.title.toLowerCase().includes(term)
    );
  }

  if (state.selectedCategories.size > 0) {
    filtered = filtered.filter((product) =>
      state.selectedCategories.has(product.category)
    );
  }

  if (state.priceRange !== "all") {
    filtered = filtered.filter((product) => {
      if (state.priceRange === "0-799") return product.price <= 799;
      if (state.priceRange === "800-1499") return product.price <= 1499 && product.price >= 800;
      if (state.priceRange === "1500") return product.price >= 1500;
      return true;
    });
  }

  if (state.quickFilter) {
    filtered = filtered.filter((product) => {
      return product.badge && product.badge.toLowerCase().replace(" ", "") === state.quickFilter;
    });
  }

  if (state.sortOrder === "low-high") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (state.sortOrder === "high-low") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (state.sortOrder === "rating") {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  return filtered;
}

function renderActiveFilters() {
  activeFilters.innerHTML = "";
  const chips = [];

  if (state.searchQuery) {
    chips.push({ label: `Search: ${state.searchQuery}`, key: "search" });
  }

  state.selectedCategories.forEach((category) => {
    chips.push({ label: category, key: `category:${category}` });
  });

  if (state.priceRange !== "all") {
    const label = state.priceRange === "0-799" ? "Under ₹799" : state.priceRange === "800-1499" ? "₹800-₹1499" : "₹1500+";
    chips.push({ label, key: "price" });
  }

  if (state.quickFilter) {
    chips.push({ label: state.quickFilter.toUpperCase(), key: "quick" });
  }

  chips.forEach((chip) => {
    const button = document.createElement("button");
    button.className = "filter-chip";
    button.innerHTML = `${chip.label} <span>&times;</span>`;
    button.addEventListener("click", () => {
      if (chip.key === "search") {
        state.searchQuery = "";
        searchInput.value = "";
      } else if (chip.key.startsWith("category:")) {
        const category = chip.key.split(":")[1];
        state.selectedCategories.delete(category);
        document.querySelectorAll(".category-filter").forEach((input) => {
          if (input.value === category) input.checked = false;
        });
      } else if (chip.key === "price") {
        state.priceRange = "all";
        document.querySelectorAll("input[name='price']").forEach((input) => {
          input.checked = input.value === "all";
        });
      } else if (chip.key === "quick") {
        state.quickFilter = null;
        quickFilters.querySelectorAll("button").forEach((button) => button.classList.remove("active"));
      }
      render();
    });
    activeFilters.appendChild(button);
  });
}

function renderProducts() {
  const filtered = applyFilters();
  productsGrid.innerHTML = "";
  productCount.textContent = `${filtered.length} products`;

  if (filtered.length === 0) {
    productsGrid.innerHTML = "<div class='empty-state'>No products match your search or filters.</div>";
    return;
  }

  filtered.forEach((product, index) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.style.animationDelay = `${index * 70}ms`;
    card.innerHTML = `
      <div class="product-media">
        ${product.badge ? `<span class="badge">${product.badge}</span>` : ""}
        <a class="product-link" href="product.html?id=${product.id}">
          <img src="${product.image}" alt="${product.title}" />
        </a>
      </div>
      <div>
        <h3 class="product-title">${product.title}</h3>
        <div class="product-meta">
          <span class="rating">★ ${product.rating.toFixed(1)}</span>
          <span class="category-tag">${product.category}</span>
        </div>
        <div class="price-row">
          <span class="price-current">${formatPrice(product.price)}</span>
          <span class="price-old">${formatPrice(product.originalPrice)}</span>
        </div>
        <div class="tag-list">
          ${product.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
        </div>
      </div>
      <div class="card-actions">
        <button class="add-btn" data-id="${product.id}">ADD TO BAG</button>
      </div>
    `;

    productsGrid.appendChild(card);
  });

  productsGrid.querySelectorAll(".add-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = Number(button.dataset.id);
      addToCart(productId);
      button.textContent = "ADDED";
      button.style.opacity = "0.8";
      setTimeout(() => {
        button.textContent = "ADD TO BAG";
        button.style.opacity = "1";
      }, 600);
    });
  });
}

function render() {
  renderActiveFilters();
  renderProducts();
}

searchInput.addEventListener("input", (event) => {
  state.searchQuery = event.target.value.trim();
  render();
});

sortSelect.addEventListener("change", (event) => {
  state.sortOrder = event.target.value;
  render();
});

clearFilters.addEventListener("click", () => {
  state.selectedCategories.clear();
  state.priceRange = "all";
  state.quickFilter = null;
  state.searchQuery = "";
  searchInput.value = "";
  document.querySelectorAll(".category-filter").forEach((input) => (input.checked = false));
  document.querySelectorAll("input[name='price']").forEach((input) => {
    input.checked = input.value === "all";
  });
  quickFilters.querySelectorAll("button").forEach((button) => button.classList.remove("active"));
  render();
});

document.querySelectorAll(".category-filter").forEach((input) => {
  input.addEventListener("change", () => {
    if (input.checked) {
      state.selectedCategories.add(input.value);
    } else {
      state.selectedCategories.delete(input.value);
    }
    render();
  });
});

document.querySelectorAll("input[name='price']").forEach((input) => {
  input.addEventListener("change", (event) => {
    state.priceRange = event.target.value;
    render();
  });
});

quickFilters.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", () => {
    const selected = button.dataset.filter;
    if (state.quickFilter === selected) {
      state.quickFilter = null;
      button.classList.remove("active");
    } else {
      state.quickFilter = selected;
      quickFilters.querySelectorAll("button").forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
    }
    render();
  });
});

updateCartCounter();
render();
