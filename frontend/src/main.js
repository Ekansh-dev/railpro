import './style.css';
const API = 'https://railsupply-backend.onrender.com';

// ─── Router ──────────────────────────────────────────────────────
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) page.classList.add('active');
  renderNav();
}

function getToken() { return localStorage.getItem('token'); }
function getUser() { return JSON.parse(localStorage.getItem('user') || 'null'); }
function isAdmin() { return localStorage.getItem('isAdmin') === 'true'; }

function logout() {
  localStorage.clear();
  renderApp();
  showPage('home');
}

// ─── Nav ─────────────────────────────────────────────────────────
function renderNav() {
  const nav = document.getElementById('main-nav');
  const token = getToken();
  const admin = isAdmin();
  nav.innerHTML = `
    <div class="logo">Lakshmi kubera  <span>contractor</span></div>
    <div class="nav-links">
      ${!token ? `
        <button class="btn-outline" onclick="showPage('login')">Dealer Login</button>
        <button class="btn-primary" onclick="showPage('register')">Register</button>
        <button class="btn-outline" onclick="showPage('adminLogin')" style="border-color:#ffd700;color:#ffd700">Admin</button>
      ` : admin ? `
        <button class="btn-outline" onclick="showPage('adminDashboard')">Dashboard</button>
        <button class="btn-logout" onclick="logout()">Logout</button>
      ` : `
        <button class="btn-outline" onclick="showPage('dealerDashboard')">My Products</button>
        <button class="btn-logout" onclick="logout()">Logout</button>
      `}
    </div>`;
}

// ─── App Shell ────────────────────────────────────────────────────
function renderApp() {
  document.getElementById('app').innerHTML = `
    <nav id="main-nav"></nav>

    <!-- HOME PAGE -->
    <div class="page active" id="home">
      <div class="hero">
        <div class="hero-badge">🚆 Trusted Railway Contractor · 15 Years Experience</div>
<h1>Lakshmi Kubera's <span>Supply Network</span></h1>
<p>We have been supplying to Indian Railways for over <strong>15 years</strong>. Register your shop, list your products with updated prices — when we get a railway contract, <strong>you get the order.</strong></p>
<div class="hero-buttons">
  <button class="btn-white" onclick="showPage('register')">📦 Register Your Shop</button>
  <button class="btn-red" onclick="showPage('login')">🔑 Dealer Login</button>
</div>
      </div>
      <div class="features">
        <h2>Why Us?</h2>
        <div class="features-grid">
          <div class="feature-card"><div class="icon">🚆</div><h3>Direct Railway Orders</h3><p>We hold active contracts with Indian Railways. List your products and get bulk orders directly from us.</p></div>
<div class="feature-card"><div class="icon">📅</div><h3>15 Years in Business</h3><p>We've been supplying to Railways since 2010. Dealers who work with us get repeat business year after year.</p></div>
<div class="feature-card"><div class="icon">💰</div><h3>Guaranteed Payment</h3><p>No payment delays. Once we get the contract and source from you, payment is processed immediately.</p></div>
<div class="feature-card"><div class="icon">📦</div><h3>Bulk Quantities</h3><p>Railway contracts mean large orders — chairs, cameras, coolers, medical equipment and more in bulk.</p></div>
        </div>
      </div>
    </div>

    <!-- REGISTER PAGE -->
    <div class="page" id="register">
      <div class="form-container">
        <h2>Dealer Registration</h2>
        <p>Create your account to start listing products</p>
        <div class="form-row">
          <div class="form-group"><label>Full Name</label><input id="reg-name" placeholder="Your name"/></div>
          <div class="form-group"><label>Shop Name</label><input id="reg-shop" placeholder="Your shop name"/></div>
        </div>
        <div class="form-group"><label>Email</label><input id="reg-email" type="email" placeholder="email@example.com"/></div>
        <div class="form-group"><label>Password</label><input id="reg-pass" type="password" placeholder="Min 6 characters"/></div>
        <div class="form-row">
          <div class="form-group"><label>Phone</label><input id="reg-phone" placeholder="10 digit number"/></div>
          <div class="form-group"><label>City</label><input id="reg-city" placeholder="Your city"/></div>
        </div>
        <div class="form-group"><label>Full Address</label><input id="reg-address" placeholder="Shop address"/></div>
        <div class="error-msg" id="reg-error"></div>
        <div class="success-msg" id="reg-success"></div>
        <button class="form-submit" onclick="registerDealer()">Create Account</button>
        <div class="form-link">Already registered? <a onclick="showPage('login')">Login here</a></div>
      </div>
    </div>

    <!-- LOGIN PAGE -->
    <div class="page" id="login">
      <div class="form-container">
        <h2>Dealer Login</h2>
        <p>Welcome back! Login to manage your products</p>
        <div class="form-group"><label>Email</label><input id="login-email" type="email" placeholder="email@example.com"/></div>
        <div class="form-group"><label>Password</label><input id="login-pass" type="password" placeholder="Your password"/></div>
        <div class="error-msg" id="login-error"></div>
        <button class="form-submit" onclick="loginDealer()">Login</button>
        <div class="form-link">New dealer? <a onclick="showPage('register')">Register here</a></div>
      </div>
    </div>

    <!-- ADMIN LOGIN PAGE -->
    <div class="page" id="adminLogin">
      <div class="form-container">
        <h2>🔐 Admin Login</h2>
        <p>Restricted access — Railway Contractor only</p>
        <div class="form-group"><label>Admin Email</label><input id="admin-email" type="email"/></div>
        <div class="form-group"><label>Admin Password</label><input id="admin-pass" type="password"/></div>
        <div class="error-msg" id="admin-error"></div>
        <button class="form-submit" onclick="loginAdmin()">Login as Admin</button>
      </div>
    </div>

    <!-- DEALER DASHBOARD -->
    <div class="page" id="dealerDashboard">
      <div class="welcome-bar">Welcome back, <span id="dealer-name">Dealer</span>! Manage your product listings below.</div>
      <div class="dashboard">
        <div class="upload-section">
          <h3>📦 Upload New Product</h3>
          <div class="form-row">
            <div class="form-group"><label>Product Name</label><input id="p-name" placeholder="e.g. HD CCTV Camera"/></div>
            <div class="form-group"><label>Category</label>
              <select id="p-category">
                <option>CCTV Cameras</option><option>Chairs & Furniture</option>
                <option>Coolers & AC</option><option>Wheelchairs & Medical</option>
                <option>Electrical Items</option><option>Plumbing & Pipes</option>
                <option>Safety Equipment</option><option>Signage & Boards</option>
                <option>Computers & Electronics</option><option>Other</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Price (₹)</label><input id="p-price" type="number" placeholder="e.g. 2500"/></div>
            <div class="form-group"><label>Product Image</label><input id="p-image" type="file" accept="image/*"/></div>
          </div>
          <div class="form-group"><label>Description / Specifications</label><textarea id="p-desc" rows="3" placeholder="e.g. 2MP, Night vision, Waterproof, 30m range..."></textarea></div>
          <div class="error-msg" id="upload-error"></div>
          <div class="success-msg" id="upload-success"></div>
          <button class="form-submit" style="max-width:200px" onclick="uploadProduct()">Upload Product</button>
        </div>

        <div class="dashboard-header">
          <h2>My Products</h2>
        </div>
        <div id="my-products" class="products-grid"></div>
      </div>
    </div>

    <!-- ADMIN DASHBOARD -->
    <div class="page" id="adminDashboard">
      <div class="welcome-bar">🚆 Admin Dashboard — <span>RailSupply Contractor Portal</span></div>
      <div class="dashboard">
        <div class="search-bar">
          <input id="search-input" placeholder="Search by product name e.g. camera, chair, cooler..." onkeydown="if(event.key==='Enter') searchProducts()"/>
          <select id="search-category" onchange="searchProducts()">
            <option value="">All Categories</option>
            <option>CCTV Cameras</option><option>Chairs & Furniture</option>
            <option>Coolers & AC</option><option>Wheelchairs & Medical</option>
            <option>Electrical Items</option><option>Plumbing & Pipes</option>
            <option>Safety Equipment</option><option>Signage & Boards</option>
            <option>Computers & Electronics</option><option>Other</option>
          </select>
          <button onclick="searchProducts()">🔍 Search</button>
        </div>
        <div id="admin-products" class="products-grid"></div>
      </div>
    </div>
  `;
  renderNav();
}

// ─── API Calls ────────────────────────────────────────────────────
async function registerDealer() {
  const err = document.getElementById('reg-error');
  const suc = document.getElementById('reg-success');
  err.style.display = 'none'; suc.style.display = 'none';
  const body = {
    name: document.getElementById('reg-name').value,
    shop_name: document.getElementById('reg-shop').value,
    email: document.getElementById('reg-email').value,
    password: document.getElementById('reg-pass').value,
    phone: document.getElementById('reg-phone').value,
    city: document.getElementById('reg-city').value,
    address: document.getElementById('reg-address').value,
  };
  try {
    const res = await fetch(`${API}/dealer/register`, {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) { err.textContent = data.detail; err.style.display = 'block'; return; }
    suc.textContent = 'Registered! Redirecting to login...';
    suc.style.display = 'block';
    setTimeout(() => showPage('login'), 1500);
  } catch(e) { err.textContent = 'Server error. Is backend running?'; err.style.display = 'block'; }
}

async function loginDealer() {
  const err = document.getElementById('login-error');
  err.style.display = 'none';
  const body = { email: document.getElementById('login-email').value, password: document.getElementById('login-pass').value };
  try {
    const res = await fetch(`${API}/dealer/login`, {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) { err.textContent = data.detail; err.style.display = 'block'; return; }
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.dealer));
    localStorage.setItem('isAdmin', 'false');
    renderApp();
    showPage('dealerDashboard');
    document.getElementById('dealer-name').textContent = data.dealer.name;
    loadMyProducts();
  } catch(e) { err.textContent = 'Server error. Is backend running?'; err.style.display = 'block'; }
}

async function loginAdmin() {
  const err = document.getElementById('admin-error');
  err.style.display = 'none';
  const body = { email: document.getElementById('admin-email').value, password: document.getElementById('admin-pass').value };
  try {
    const res = await fetch(`${API}/admin/login`, {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) { err.textContent = data.detail; err.style.display = 'block'; return; }
    localStorage.setItem('token', data.token);
    localStorage.setItem('isAdmin', 'true');
    renderApp();
    showPage('adminDashboard');
    searchProducts();
  } catch(e) { err.textContent = 'Server error. Is backend running?'; err.style.display = 'block'; }
}

async function uploadProduct() {
  const err = document.getElementById('upload-error');
  const suc = document.getElementById('upload-success');
  err.style.display = 'none'; suc.style.display = 'none';
  const form = new FormData();
  form.append('name', document.getElementById('p-name').value);
  form.append('category', document.getElementById('p-category').value);
  form.append('price', document.getElementById('p-price').value);
  form.append('description', document.getElementById('p-desc').value);
  const img = document.getElementById('p-image').files[0];
  if (img) form.append('image', img);
  try {
    const res = await fetch(`${API}/products`, {
      method: 'POST', headers: {'Authorization': `Bearer ${getToken()}`}, body: form
    });
    const data = await res.json();
    if (!res.ok) { err.textContent = data.detail; err.style.display = 'block'; return; }
    suc.textContent = '✅ Product uploaded successfully!';
    suc.style.display = 'block';
    document.getElementById('p-name').value = '';
    document.getElementById('p-price').value = '';
    document.getElementById('p-desc').value = '';
    document.getElementById('p-image').value = '';
    setTimeout(() => { suc.style.display = 'none'; }, 3000);
    loadMyProducts();
  } catch(e) { err.textContent = 'Server error. Is backend running?'; err.style.display = 'block'; }
}

async function loadMyProducts() {
  const container = document.getElementById('my-products');
  if (!container) return;
  container.innerHTML = '<div class="loading">Loading your products...</div>';
  const res = await fetch(`${API}/products/mine`, { headers: {'Authorization': `Bearer ${getToken()}`} });
  const products = await res.json();
  if (!products.length) {
    container.innerHTML = '<div class="empty-state"><div class="icon">📦</div><p>No products yet. Upload your first product above!</p></div>';
    return;
  }
  container.innerHTML = products.map(p => productCard(p, true)).join('');
}

async function searchProducts() {
  const container = document.getElementById('admin-products');
  if (!container) return;
  const search = document.getElementById('search-input')?.value || '';
  const category = document.getElementById('search-category')?.value || '';
  container.innerHTML = '<div class="loading">Searching suppliers...</div>';
  let url = `${API}/admin/products?search=${encodeURIComponent(search)}`;
  if (category) url += `&category=${encodeURIComponent(category)}`;
  const res = await fetch(url, { headers: {'Authorization': `Bearer ${getToken()}`} });
  const products = await res.json();
  if (!products.length) {
    container.innerHTML = '<div class="empty-state"><div class="icon">🔍</div><p>No products found. Try a different search.</p></div>';
    return;
  }
  container.innerHTML = products.map(p => productCard(p, false)).join('');
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  await fetch(`${API}/products/${id}`, { method: 'DELETE', headers: {'Authorization': `Bearer ${getToken()}`} });
  loadMyProducts();
}

// ─── Product Card ─────────────────────────────────────────────────
function productCard(p, isDealer) {
  const updatedAt = new Date(p.updated_at);
  const daysSince = Math.floor((Date.now() - updatedAt) / (1000 * 60 * 60 * 24));
  const stale = daysSince > 30;
  const dealer = p.dealers || {};
  return `
    <div class="product-card">
      ${p.image_url ? `<img src="${p.image_url}" alt="${p.name}" onerror="this.style.display='none'"/>` : `<div class="no-img">📦</div>`}
      <div class="card-body">
        <div class="category">${p.category}</div>
        <h3>${p.name}</h3>
        ${stale ? `<span class="stale-badge">⚠️ Price may be outdated</span>` : ''}
        <div class="price">₹${Number(p.price).toLocaleString('en-IN')}</div>
        <div class="desc">${p.description || 'No description provided'}</div>
        ${!isDealer ? `
          <div class="dealer-info">
            🏪 <strong>${dealer.shop_name || 'N/A'}</strong><br/>
            👤 ${dealer.name || ''} &nbsp;|&nbsp; 📍 ${dealer.city || ''}<br/>
            <div class="phone">📞 ${dealer.phone || 'N/A'}</div>
          </div>
        ` : ''}
        <div class="updated-badge">🕒 Updated ${daysSince === 0 ? 'today' : daysSince + ' days ago'}</div>
        ${isDealer ? `<div class="card-actions"><button class="btn-delete" onclick="deleteProduct('${p.id}')">🗑 Delete</button></div>` : ''}
      </div>
    </div>`;
}

// ─── Init ─────────────────────────────────────────────────────────
renderApp();

// Auto-redirect if already logged in
if (getToken()) {
  if (isAdmin()) {
    showPage('adminDashboard');
    setTimeout(searchProducts, 100);
  } else {
    showPage('dealerDashboard');
    const user = getUser();
    setTimeout(() => {
      const el = document.getElementById('dealer-name');
      if (el && user) el.textContent = user.name;
      loadMyProducts();
    }, 100);
  }
}

window.showPage = showPage;
window.registerDealer = registerDealer;
window.loginDealer = loginDealer;
window.loginAdmin = loginAdmin;
window.uploadProduct = uploadProduct;
window.deleteProduct = deleteProduct;
window.searchProducts = searchProducts;
window.logout = logout;