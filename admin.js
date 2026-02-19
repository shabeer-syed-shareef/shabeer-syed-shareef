const adminTokenInput = document.getElementById('admin-token');
const listEl = document.getElementById('admin-product-list');

const nameInput = document.getElementById('name');
const priceInput = document.getElementById('price');
const imageInput = document.getElementById('image');
const descInput = document.getElementById('desc');
const createButton = document.getElementById('create-product');

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-admin-token': adminTokenInput.value.trim()
  };
}

function productItemMarkup(item) {
  return `
    <div class="row">
      <div>
        <strong>${item.name}</strong>
        <p>${item.desc}</p>
        <small>$${item.price.toFixed(2)}</small>
      </div>
      <button class="delete-product" data-id="${item.id}">Delete</button>
    </div>
  `;
}

async function loadAdminProducts() {
  listEl.innerHTML = '<li>Loading...</li>';

  const response = await fetch('/api/admin/products', {
    headers: getHeaders()
  });

  if (!response.ok) {
    listEl.innerHTML = '<li>Unauthorized. Enter valid admin token.</li>';
    return;
  }

  const products = await response.json();
  listEl.innerHTML = '';

  products.forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = productItemMarkup(item);
    listEl.appendChild(li);
  });
}

async function createProduct() {
  const payload = {
    name: nameInput.value.trim(),
    desc: descInput.value.trim(),
    image: imageInput.value.trim(),
    price: Number(priceInput.value)
  };

  const response = await fetch('/api/admin/products', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    alert('Failed to create product. Check token and fields.');
    return;
  }

  nameInput.value = '';
  descInput.value = '';
  imageInput.value = '';
  priceInput.value = '';
  await loadAdminProducts();
}

listEl.addEventListener('click', async (event) => {
  const target = event.target;
  if (!target.classList.contains('delete-product')) {
    return;
  }

  const id = target.dataset.id;
  const response = await fetch(`/api/admin/products/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });

  if (!response.ok) {
    alert('Delete failed. Check token.');
    return;
  }

  await loadAdminProducts();
});

createButton.addEventListener('click', createProduct);
adminTokenInput.addEventListener('change', loadAdminProducts);

loadAdminProducts();
