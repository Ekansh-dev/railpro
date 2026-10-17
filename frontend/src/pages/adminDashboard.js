import { dealersApi } from '../api/dealers.js';
import { staffApi } from '../api/staff.js';
import { productsApi } from '../api/products.js';
import { categoriesApi } from '../api/categories.js';
import { showToast } from '../components/toast.js';
import { openModal, closeModal } from '../components/modal.js';
import { renderDealerCard } from '../components/cards/dealerCard.js';
import { renderProductCard } from '../components/cards/productCard.js';

let currentDealerFilter = 'all';

export function renderAdminDashboard(container) {
  container.innerHTML = `
    <div class="welcome-bar">
      <div>🚆 <strong>Lakshmi Kubera Contractor Portal</strong> — Master Administration</div>
      <span class="role-tag admin">SUPER ADMIN</span>
    </div>
    <div class="dashboard-container">
      <div class="subtab-nav">
        <button class="subtab-btn active" id="btn-tab-dealers">
          🏪 Dealer Requests <span class="chip" id="admin-pending-dealers-chip">0</span>
        </button>
        <button class="subtab-btn" id="btn-tab-managers">
          🛡️ Managers & RBAC
        </button>
        <button class="subtab-btn" id="btn-tab-catalog">
          📦 Contractor Catalog
        </button>
        <button class="subtab-btn" id="btn-tab-categories">
          🏷️ Categories Hub
        </button>
      </div>

      <!-- Subtab 1: Dealers -->
      <div id="admin-view-dealers">
        <div class="section-top">
          <h2>Dealer Applications</h2>
          <div style="display:flex; gap:8px;">
            <button class="btn-outline btn-filter-dealer" data-filter="all">All</button>
            <button class="btn-outline btn-filter-dealer" data-filter="pending" style="border-color:var(--gold);">⏳ Pending Only</button>
            <button class="btn-outline btn-filter-dealer" data-filter="approved" style="border-color:var(--emerald);">✅ Approved</button>
          </div>
        </div>
        <div id="admin-dealers-grid" class="dealers-grid">
          <div class="loading-spinner"></div>
        </div>
      </div>

      <!-- Subtab 2: Managers (RBAC) -->
      <div id="admin-view-managers" style="display:none;">
        <div class="section-top">
          <h2>Operations Managers</h2>
          <button class="btn-primary" id="btn-open-invite-modal">+ Invite New Manager</button>
        </div>
        <div id="admin-managers-table-box">
          <div class="loading-spinner"></div>
        </div>
      </div>

      <!-- Subtab 3: Contractor Catalog -->
      <div id="admin-view-catalog" style="display:none;">
        <div class="search-bar">
          <input id="admin-search-text" placeholder="Search approved products by title or specs..."/>
          <select id="admin-search-cat">
            <option value="">All Categories</option>
          </select>
          <button class="btn-primary" id="btn-admin-search">🔍 Search</button>
        </div>
        <div id="admin-catalog-grid" class="products-grid">
          <div class="loading-spinner"></div>
        </div>
      </div>

      <!-- Subtab 4: Categories Hub -->
      <div id="admin-view-categories" style="display:none;">
        <div class="section-top">
          <h2>Product Categories</h2>
          <button class="btn-primary" id="btn-open-category-modal">+ Add Category</button>
        </div>
        <div id="admin-categories-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:14px;">
          <div class="loading-spinner"></div>
        </div>
      </div>
    </div>`;

  // Subtab navigation logic
  const views = {
    dealers: container.querySelector('#admin-view-dealers'),
    managers: container.querySelector('#admin-view-managers'),
    catalog: container.querySelector('#admin-view-catalog'),
    categories: container.querySelector('#admin-view-categories'),
  };

  const buttons = {
    dealers: container.querySelector('#btn-tab-dealers'),
    managers: container.querySelector('#btn-tab-managers'),
    catalog: container.querySelector('#btn-tab-catalog'),
    categories: container.querySelector('#btn-tab-categories'),
  };

  function switchTab(activeTab) {
    Object.keys(views).forEach(key => {
      views[key].style.display = key === activeTab ? 'block' : 'none';
      buttons[key].classList.toggle('active', key === activeTab);
    });

    if (activeTab === 'dealers') loadDealers(container);
    if (activeTab === 'managers') loadManagers(container);
    if (activeTab === 'catalog') loadCatalog(container);
    if (activeTab === 'categories') loadCategories(container);
  }

  buttons.dealers.addEventListener('click', () => switchTab('dealers'));
  buttons.managers.addEventListener('click', () => switchTab('managers'));
  buttons.catalog.addEventListener('click', () => switchTab('catalog'));
  buttons.categories.addEventListener('click', () => switchTab('categories'));

  // Dealer filter buttons
  container.querySelectorAll('.btn-filter-dealer').forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentDealerFilter = e.currentTarget.dataset.filter;
      loadDealers(container);
    });
  });

  // Open invite manager modal
  container.querySelector('#btn-open-invite-modal')?.addEventListener('click', () => {
    openInviteModal(container);
  });

  // Open add category modal
  container.querySelector('#btn-open-category-modal')?.addEventListener('click', () => {
    openAddCategoryModal(container);
  });

  // Search catalog
  container.querySelector('#btn-admin-search')?.addEventListener('click', () => loadCatalog(container));
  container.querySelector('#admin-search-text')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loadCatalog(container);
  });
  container.querySelector('#admin-search-cat')?.addEventListener('change', () => loadCatalog(container));

  // Initial load
  loadDealers(container);
}

// ─── TAB 1: DEALERS ─────────────────────────────────────────────
async function loadDealers(container) {
  const grid = container.querySelector('#admin-dealers-grid');
  if (!grid) return;
  grid.innerHTML = '<div class="loading-spinner"></div>';

  try {
    const dealers = await dealersApi.listDealers(currentDealerFilter);

    // Update pending chip
    const pendingCount = dealers.filter(d => d.status === 'pending').length;
    const chip = container.querySelector('#admin-pending-dealers-chip');
    if (chip) chip.textContent = pendingCount;

    if (!dealers.length) {
      grid.innerHTML = `<div class="empty-state"><span class="icon">🏪</span><p>No dealers found for filter '${currentDealerFilter}'.</p></div>`;
      return;
    }

    grid.innerHTML = '';
    dealers.forEach(d => {
      const card = renderDealerCard(
        d,
        async (dealerId) => {
          try {
            const res = await dealersApi.approveDealer(dealerId);
            showToast(res.message || 'Dealer approved!', 'success');
            loadDealers(container);
          } catch (err) {
            showToast(err.message || 'Failed to approve.', 'error');
          }
        },
        async (dealerId) => {
          try {
            const res = await dealersApi.rejectDealer(dealerId);
            showToast(res.message || 'Dealer rejected.', 'info');
            loadDealers(container);
          } catch (err) {
            showToast(err.message || 'Failed to reject.', 'error');
          }
        }
      );
      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = '<div class="empty-state"><p>Error connecting to backend.</p></div>';
  }
}

// ─── TAB 2: MANAGERS (RBAC) ─────────────────────────────────────
async function loadManagers(container) {
  const box = container.querySelector('#admin-managers-table-box');
  if (!box) return;
  box.innerHTML = '<div class="loading-spinner"></div>';

  try {
    const managers = await staffApi.listManagers();
    if (!managers.length) {
      box.innerHTML = '<div class="empty-state"><span class="icon">🛡️</span><p>No managers invited yet. Click "+ Invite New Manager" to create an account.</p></div>';
      return;
    }

    box.innerHTML = `
      <table class="managers-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Invited On</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${managers.map(m => `
            <tr>
              <td><strong>${m.name}</strong></td>
              <td>${m.email}</td>
              <td><span class="role-tag manager">MANAGER</span></td>
              <td>${new Date(m.created_at).toLocaleDateString()}</td>
              <td>
                <button class="btn-danger btn-remove-mgr" data-id="${m.id}" style="padding:4px 10px; font-size:12px;">Remove</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;

    box.querySelectorAll('.btn-remove-mgr').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        if (!confirm('Remove this manager account?')) return;
        try {
          await staffApi.deleteManager(id);
          showToast('Manager removed.', 'info');
          loadManagers(container);
        } catch (err) {
          showToast(err.message || 'Delete failed.', 'error');
        }
      });
    });
  } catch (err) {
    box.innerHTML = '<div class="empty-state"><p>Error loading managers.</p></div>';
  }
}

function openInviteModal(container) {
  const html = `
    <div id="modal-invite-form-wrap">
      <div class="form-group">
        <label>Manager Full Name</label>
        <input id="inv-modal-name" placeholder="e.g. Rajesh Verma" required/>
      </div>
      <div class="form-group">
        <label>Manager Email Address</label>
        <input id="inv-modal-email" type="email" placeholder="rajesh@railsupply.com" required/>
      </div>
      <p style="font-size:12px; color:var(--text-muted); margin-bottom:16px;">
        An account will be automatically created in the database and a secure temporary password generated.
      </p>
      <button class="btn-primary" id="btn-submit-invite-mgr" style="width:100%; justify-content:center;">Create & Generate Password</button>
    </div>
    <div id="modal-invite-result-wrap" style="display:none;"></div>
  `;
  openModal('🛡️ Invite Operations Manager', html);

  document.getElementById('btn-submit-invite-mgr')?.addEventListener('click', async () => {
    const name = document.getElementById('inv-modal-name')?.value.trim();
    const email = document.getElementById('inv-modal-email')?.value.trim();

    if (!name || !email) {
      showToast('Please fill out both name and email.', 'error');
      return;
    }

    try {
      const data = await staffApi.inviteManager(name, email);
      document.getElementById('modal-invite-form-wrap').style.display = 'none';
      const resultWrap = document.getElementById('modal-invite-result-wrap');
      resultWrap.style.display = 'block';
      resultWrap.innerHTML = `
        <div style="text-align:center; padding:10px 0;">
          <span style="font-size:42px;">🎉</span>
          <h4 style="font-family:var(--font-heading); font-size:18px; margin:12px 0 6px;">Manager Account Created!</h4>
          <p style="font-size:13px; color:var(--text-muted);">Share these credentials with <strong>${data.manager.email}</strong>:</p>
          <div class="copy-box">
            <code>${data.temporary_password}</code>
            <button class="btn-outline" id="btn-copy-pwd" style="padding:6px 12px; font-size:12px;">📋 Copy</button>
          </div>
          <button class="btn-primary" id="btn-done-invite" style="width:100%; justify-content:center; margin-top:14px;">Done</button>
        </div>`;

      document.getElementById('btn-copy-pwd')?.addEventListener('click', () => {
        navigator.clipboard.writeText(data.temporary_password);
        showToast('Password copied to clipboard!', 'info');
      });

      document.getElementById('btn-done-invite')?.addEventListener('click', () => {
        closeModal();
        loadManagers(container);
      });

      showToast('Manager created successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Invite failed.', 'error');
    }
  });
}

// ─── TAB 3: CONTRACTOR CATALOG ──────────────────────────────────
async function loadCatalog(container) {
  const grid = container.querySelector('#admin-catalog-grid');
  const search = container.querySelector('#admin-search-text')?.value || '';
  const category = container.querySelector('#admin-search-cat')?.value || '';

  grid.innerHTML = '<div class="loading-spinner"></div>';
  try {
    // Populate categories select if empty
    const catSelect = container.querySelector('#admin-search-cat');
    if (catSelect && catSelect.children.length <= 1) {
      const cats = await categoriesApi.list();
      catSelect.innerHTML = '<option value="">All Categories</option>' +
        cats.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    }

    const products = await productsApi.searchContractorCatalog(search, category);
    if (!products.length) {
      grid.innerHTML = '<div class="empty-state"><span class="icon">🔍</span><p>No products match your criteria.</p></div>';
      return;
    }

    grid.innerHTML = '';
    products.forEach(p => {
      const card = renderProductCard(p, false, async (productId) => {
        if (!confirm('Remove this product permanently from the contractor catalog?')) return;
        try {
          await productsApi.adminDeleteProduct(productId);
          showToast('Product removed by admin.', 'info');
          loadCatalog(container);
        } catch (err) {
          showToast(err.message || 'Failed to remove.', 'error');
        }
      });
      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = '<div class="empty-state"><p>Error searching catalog.</p></div>';
  }
}

// ─── TAB 4: CATEGORIES HUB ──────────────────────────────────────
async function loadCategories(container) {
  const grid = container.querySelector('#admin-categories-grid');
  grid.innerHTML = '<div class="loading-spinner"></div>';

  try {
    const categories = await categoriesApi.list();
    grid.innerHTML = categories.map(c => `
      <div style="background:var(--bg-card); border:1px solid var(--border); padding:16px; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">
        <strong>${c.name}</strong>
        <span class="status-badge ${c.is_inbuilt ? 'inbuilt' : 'custom'}">${c.is_inbuilt ? 'Inbuilt' : 'Custom'}</span>
      </div>
    `).join('');
  } catch (err) {
    grid.innerHTML = '<div class="empty-state"><p>Error loading categories.</p></div>';
  }
}

function openAddCategoryModal(container) {
  const html = `
    <div class="form-group">
      <label>Category Name</label>
      <input id="new-cat-modal-input" placeholder="e.g. Signal Cables & Relays" required/>
    </div>
    <button class="btn-primary" id="btn-submit-new-cat" style="width:100%; justify-content:center;">Add Category</button>
  `;
  openModal('🏷️ Add New Category', html);

  document.getElementById('btn-submit-new-cat')?.addEventListener('click', async () => {
    const name = document.getElementById('new-cat-modal-input')?.value.trim();
    if (!name) return;
    try {
      await categoriesApi.create(name);
      showToast('Category created successfully!', 'success');
      closeModal();
      loadCategories(container);
    } catch (err) {
      showToast(err.message || 'Failed to create category.', 'error');
    }
  });
}
