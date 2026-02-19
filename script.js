const fallbackProducts = [
  {
    id: 1,
    name: 'AirPulse Headphones',
    desc: 'Wireless over-ear comfort with deep bass.',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    name: 'ZenLamp Mini',
    desc: 'Soft ambient light perfect for desks and nightstands.',
    price: 34.5,
    image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    name: 'FitTrack Pro Band',
    desc: 'Heart-rate, sleep and activity tracking made easy.',
    price: 59,
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 4,
    name: 'CarryMate Backpack',
    desc: 'Lightweight, water-resistant, and commuter-friendly.',
    price: 74,
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80'
  }
];

const productGrid = document.getElementById('product-grid');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const cartPanel = document.getElementById('cart-panel');
const cartToggle = document.getElementById('cart-toggle');
const closeCart = document.getElementById('close-cart');

const cart = [];
let products = [];

const formatCurrency = (value) => `$${value.toFixed(2)}`;

function renderProducts() {
  productGrid.innerHTML = '';

  products.forEach((product) => {
    const card = document.createElement('article');
    card.className = 'product';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" loading="lazy" />
      <h3>${product.name}</h3>
      <p>${product.desc}</p>
      <div class="row">
        <strong>${formatCurrency(product.price)}</strong>
        <button data-id="${product.id}">Add</button>
      </div>
    `;
    productGrid.appendChild(card);
  });
}

function updateCartUI() {
  cartItems.innerHTML = '';

  cart.forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="row">
        <span>${item.name}</span>
        <strong>${formatCurrency(item.price)}</strong>
      </div>
      <small>Qty: ${item.quantity}</small>
    `;
    cartItems.appendChild(li);
  });

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

  cartCount.textContent = totalCount;
  cartTotal.textContent = formatCurrency(totalPrice);
}

function addToCart(productId) {
  const found = products.find((product) => product.id === productId);
  if (!found) {
    return;
  }

  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...found, quantity: 1 });
  }

  updateCartUI();
}

async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error('Failed to load products');
    }
    products = await response.json();
  } catch {
    products = fallbackProducts;
  }

  renderProducts();
}

productGrid.addEventListener('click', (event) => {
  if (event.target.tagName !== 'BUTTON') {
    return;
  }

  const id = Number(event.target.dataset.id);
  addToCart(id);
});

cartToggle.addEventListener('click', () => {
  cartPanel.classList.add('open');
  cartPanel.setAttribute('aria-hidden', 'false');
});

closeCart.addEventListener('click', () => {
  cartPanel.classList.remove('open');
  cartPanel.setAttribute('aria-hidden', 'true');
});

loadProducts();
updateCartUI();
