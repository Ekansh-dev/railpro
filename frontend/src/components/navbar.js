import { store } from '../state/store.js';

export function renderNavbar(container) {
  const isAuth = store.isAuthenticated();
  const role = store.role;
  const user = store.user;

  container.innerHTML = `
    <div class="logo" id="nav-brand-logo">
      Lakshmi Kubera <span>RailSupply</span>
      <span class="badge">15 YRS EXP</span>
    </div>
    <div class="nav-links">
      ${!isAuth ? `
        <button class="btn-outline" id="nav-btn-login">🔑 Login</button>
        <button class="btn-primary" id="nav-btn-register">📦 Register Shop</button>
      ` : `
        <div class="user-badge">
          <span class="role-tag ${role}">${role}</span>
          <span>${user?.shop_name || user?.name || user?.email || 'User'}</span>
        </div>
        ${role === 'admin' ? `
          <button class="btn-outline" id="nav-btn-admin">Admin Portal</button>
        ` : role === 'manager' ? `
          <button class="btn-outline" id="nav-btn-manager">Review Queue</button>
        ` : `
          <button class="btn-outline" id="nav-btn-dealer">My Products</button>
        `}
        <button class="btn-logout" id="nav-btn-logout">Logout</button>
      `}
    </div>`;

  // Attach event listeners
  document.getElementById('nav-brand-logo')?.addEventListener('click', () => store.navigate('home'));
  document.getElementById('nav-btn-login')?.addEventListener('click', () => store.navigate('login'));
  document.getElementById('nav-btn-register')?.addEventListener('click', () => store.navigate('register'));
  document.getElementById('nav-btn-admin')?.addEventListener('click', () => store.navigate('adminDashboard'));
  document.getElementById('nav-btn-manager')?.addEventListener('click', () => store.navigate('managerDashboard'));
  document.getElementById('nav-btn-dealer')?.addEventListener('click', () => store.navigate('dealerDashboard'));
  document.getElementById('nav-btn-logout')?.addEventListener('click', () => store.clearSession());
}
