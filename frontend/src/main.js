import './style.css';

// API Configuration - Auto-detect local vs production
const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'  // Local development
  : 'https://railsupply-backend.onrender.com';  // Production

// ─── Router ──────────────────────────────────────────────────────
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) page.classList.add('active');
  renderNav();
}

function getToken() { return localStorage.getItem('token'); }
function getUser() { return JSON.parse(localStorage.getItem('user') || 'null'); }
function getRole() { return localStorage.getItem('role') || 'dealer'; }

function logout() {
  localStorage.clear();
  renderApp();
  showPage('home');
}

// ─── Nav ─────────────────────────────────────────────────────────
function renderNav() {
  const nav = document.getElementById('main-nav');
  const token = getToken();
  const role = getRole();
  nav.innerHTML = `
    <div class="logo">Lakshmi kubera  <span>contractor</span></div>
    <div class="nav-links">
      ${!token ? `
        <button class="btn-outline" onclick="showPage('login')">Login</button>
        <button class="btn-primary" onclick="showPage('register')">Register</button>
      ` : role === 'admin' ? `
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
          <button class="btn-red" onclick="showPage('login')">🔑 Login</button>
        </div>
      </div>
      <div class="features">
        <h2>Why Us?</h2>
        <div class="features-grid">
          <div class="feature-card"><div class="icon">🚆</div><h3>Direct Railway Orders</h3><p>We hold active contracts with Indian Railways. Dealers who work with us get bulk orders directly from us.</p></div>
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

    <!-- LOGIN PAGE with Role Selection -->
    <div class="page" id="login">
      <div class="form-container">
        <h2>Welcome Back</h2>
        <p>Login to access your account</p>
        
        <!-- Role Selection Tabs -->
        <div class="role-tabs">
          <button class="role-tab active" data-role="dealer" onclick="selectRole('dealer', this)">
            <span class="role-icon">🏪</span> Dealer
          </button>
          <button class="role-tab" data-role="admin" onclick="selectRole('admin', this)">
            <span class="role-icon">🔐</span> Admin
          </button>
        </div>

        <div class="form-group"><label>Email</label><input id="login-email" type="email" placeholder="email@example.com"/></div>
        <div class="form-group"><label>Password</label><input id="login-pass" type="password" placeholder="Your password"/></div>
        <div class="error-msg" id="login-error"></div>
        <button class="form-submit" onclick="loginUser()">Login</button>
        <div class="form-link">New dealer? <a onclick="showPage('register')">Register here</a></div>
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

// ─── Role Selection ──────────────────────────────────────────────
let selectedRole = 'dealer';

function selectRole(role, element) {
  selectedRole = role;
  document.querySelectorAll('.role-tab').forEach(tab => tab.classList.remove('active'));
  element.classList.add('active');
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

async function loginUser() {
  const err = document.getElementById('login-error');
  err.style.display = 'none';
  
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-pass').value;
  
  // Validate input
  if (!email || !password) {
    err.textContent = 'Please enter both email and password';
    err.style.display = 'block';
    return;
  }
  
  const body = {
    email: email,
    password: password,
    role: selectedRole
  };
  
  console.log(`[LOGIN] Attempting login for ${email} as ${selectedRole}`);
  
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)
    });
    
    console.log(`[LOGIN] Response status: ${res.status}`);
    
    const data = await res.json();
    
    if (!res.ok) {
      console.error(`[LOGIN] Login failed: ${data.detail}`);
      err.textContent = data.detail || 'Invalid credentials. Please check your email and password.';
      err.style.display = 'block';
      return;
    }
    
    console.log(`[LOGIN] Login successful for ${email}`);
    
    // Clear any old data first
    localStorage.clear();
    
    // Store new session data
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    renderApp();
    if (data.role === 'admin') {
      showPage('adminDashboard');
      searchProducts();
    } else {
      showPage('dealerDashboard');
      document.getElementById('dealer-name').textContent = data.user.name;
      loadMyProducts();
    }
  } catch(e) {
    console.error(`[LOGIN] Error: ${e.message}`);
    err.textContent = 'Connection error. Please check your internet connection and try again.';
    err.style.display = 'block';
  }
}

// Legacy login functions for backward compatibility
async function loginDealer() {
  selectedRole = 'dealer';
  loginUser();
}

async function loginAdmin() {
  selectedRole = 'admin';
  loginUser();
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

async function adminDeleteProduct(id) {
  if (!confirm('Delete this product? This cannot be undone.')) return;
  try {
    const res = await fetch(`${API}/admin/products/${id}`, {
      method: 'DELETE',
      headers: {'Authorization': `Bearer ${getToken()}`}
    });
    const data = await res.json();
    if (!res.ok) { alert(data.detail); return; }
    searchProducts();
  } catch(e) { alert('Server error. Try again.'); }
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
        ${isDealer
          ? `<div class="card-actions"><button class="btn-delete" onclick="deleteProduct('${p.id}')">🗑 Delete</button></div>`
          : `<div class="card-actions"><button class="btn-delete" onclick="adminDeleteProduct('${p.id}')">🗑 Remove Product</button></div>`
        }
      </div>
    </div>`;
}

// ─── Init ─────────────────────────────────────────────────────────
renderApp();

if (getToken()) {
  const role = getRole();
  if (role === 'admin') {
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
window.loginUser = loginUser;
window.selectRole = selectRole;
window.uploadProduct = uploadProduct;
window.deleteProduct = deleteProduct;
window.adminDeleteProduct = adminDeleteProduct;
window.searchProducts = searchProducts;
window.logout = logout;