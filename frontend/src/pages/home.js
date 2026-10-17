import { store } from '../state/store.js';

export function renderHomePage(container) {
  container.innerHTML = `
    <div class="hero">
      <div class="hero-badge">🚆 Direct Indian Railways Contractor & Supplier Network</div>
      <h1>Powering Indian Railways with <span>Verified Suppliers</span></h1>
      <p>Lakshmi Kubera Contractor has supplied to Indian Railways since 2010. Register your shop, upload your products with live prices — when we win railway tenders, <strong>you get the bulk orders.</strong></p>
      <div class="hero-buttons">
        <button class="btn-primary" id="hero-btn-register">📦 Register Your Shop</button>
        <button class="btn-outline" id="hero-btn-login">🔑 Portal Login</button>
      </div>
    </div>
    
    <div class="features">
      <h2>How It Works</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="icon">🏪</div>
          <h3>1. Register Your Shop</h3>
          <p>Fill out your business details. Our admin reviews and approves genuine suppliers to maintain high railway quality.</p>
        </div>
        <div class="feature-card">
          <div class="icon">🛡️</div>
          <h3>2. Manager Moderation</h3>
          <p>Our dedicated operations managers inspect and approve product listings to ensure specifications meet railway standards.</p>
        </div>
        <div class="feature-card">
          <div class="icon">📦</div>
          <h3>3. Bulk Railway Contracts</h3>
          <p>When tender orders are finalized, we source directly from our approved dealer catalog with prompt guaranteed payments.</p>
        </div>
      </div>
    </div>`;

  container.querySelector('#hero-btn-register')?.addEventListener('click', () => store.navigate('register'));
  container.querySelector('#hero-btn-login')?.addEventListener('click', () => store.navigate('login'));
}
