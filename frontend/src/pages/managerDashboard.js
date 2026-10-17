import { productsApi } from '../api/products.js';
import { showToast } from '../components/toast.js';
import { openModal, closeModal } from '../components/modal.js';
import { renderReviewCard } from '../components/cards/reviewCard.js';
import { renderProductCard } from '../components/cards/productCard.js';

export function renderManagerDashboard(container) {
  container.innerHTML = `
    <div class="welcome-bar">
      <div>🛡️ <strong>Operations Manager Dashboard</strong> — Product Moderation</div>
      <span class="role-tag manager">MANAGER</span>
    </div>
    <div class="dashboard-container">
      <div class="subtab-nav">
        <button class="subtab-btn active" id="btn-mgr-tab-queue">
          ⏳ Review Queue <span class="chip" id="mgr-queue-chip">0</span>
        </button>
        <button class="subtab-btn" id="btn-mgr-tab-catalog">
          🔍 Contractor Catalog
        </button>
      </div>

      <!-- Manager Subtab 1: Review Queue -->
      <div id="mgr-view-queue">
        <div class="section-top">
          <h2>Products Queued for Approval</h2>
          <p style="color:var(--text-muted); font-size:14px;">Review specifications and approve or reject submissions from registered dealers.</p>
        </div>
        <div id="mgr-pending-grid" class="products-grid">
          <div class="loading-spinner"></div>
        </div>
      </div>

      <!-- Manager Subtab 2: Catalog -->
      <div id="mgr-view-catalog" style="display:none;">
        <div class="search-bar">
          <input id="mgr-search-text" placeholder="Search approved items by keyword..."/>
          <button class="btn-primary" id="btn-mgr-search">🔍 Search</button>
        </div>
        <div id="mgr-catalog-grid" class="products-grid">
          <div class="loading-spinner"></div>
        </div>
      </div>
    </div>`;

  const queueView = container.querySelector('#mgr-view-queue');
  const catalogView = container.querySelector('#mgr-view-catalog');
  const queueBtn = container.querySelector('#btn-mgr-tab-queue');
  const catalogBtn = container.querySelector('#btn-mgr-tab-catalog');

  queueBtn.addEventListener('click', () => {
    queueView.style.display = 'block';
    catalogView.style.display = 'none';
    queueBtn.classList.add('active');
    catalogBtn.classList.remove('active');
    loadPendingQueue(container);
  });

  catalogBtn.addEventListener('click', () => {
    queueView.style.display = 'none';
    catalogView.style.display = 'block';
    catalogBtn.classList.add('active');
    queueBtn.classList.remove('active');
    loadCatalog(container);
  });

  container.querySelector('#btn-mgr-search')?.addEventListener('click', () => loadCatalog(container));
  container.querySelector('#mgr-search-text')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loadCatalog(container);
  });

  loadPendingQueue(container);
}

async function loadPendingQueue(container) {
  const grid = container.querySelector('#mgr-pending-grid');
  grid.innerHTML = '<div class="loading-spinner"></div>';

  try {
    const products = await productsApi.getPendingQueue();
    const chip = container.querySelector('#mgr-queue-chip');
    if (chip) chip.textContent = products.length;

    if (!products.length) {
      grid.innerHTML = '<div class="empty-state"><span class="icon">🎉</span><p>All clear! No products currently pending review.</p></div>';
      return;
    }

    grid.innerHTML = '';
    products.forEach(p => {
      const card = renderReviewCard(
        p,
        // On Approve
        async (productId) => {
          try {
            const res = await productsApi.reviewProduct(productId, 'approve');
            showToast(res.message || 'Product approved!', 'success');
            loadPendingQueue(container);
          } catch (err) {
            showToast(err.message || 'Approval failed.', 'error');
          }
        },
        // On Reject
        (productId) => {
          openRejectModal(productId, container);
        }
      );
      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = '<div class="empty-state"><p>Error connecting to backend.</p></div>';
  }
}

function openRejectModal(productId, container) {
  const html = `
    <div class="form-group">
      <label>Rejection Reason / Feedback for Dealer</label>
      <textarea id="modal-reject-reason" rows="3" placeholder="e.g. Price is missing GST, or photo is blurry. Please re-upload with BIS certificate."></textarea>
    </div>
    <button class="btn-danger" id="btn-confirm-reject-modal" style="width:100%; justify-content:center;">Confirm Product Rejection</button>
  `;
  openModal('❌ Reject Product', html);

  document.getElementById('btn-confirm-reject-modal')?.addEventListener('click', async () => {
    const reason = document.getElementById('modal-reject-reason')?.value.trim();
    try {
      const res = await productsApi.reviewProduct(productId, 'reject', reason);
      showToast(res.message || 'Product rejected.', 'info');
      closeModal();
      loadPendingQueue(container);
    } catch (err) {
      showToast(err.message || 'Rejection failed.', 'error');
    }
  });
}

async function loadCatalog(container) {
  const grid = container.querySelector('#mgr-catalog-grid');
  const search = container.querySelector('#mgr-search-text')?.value || '';
  grid.innerHTML = '<div class="loading-spinner"></div>';

  try {
    const products = await productsApi.searchContractorCatalog(search);
    if (!products.length) {
      grid.innerHTML = '<div class="empty-state"><span class="icon">🔍</span><p>No products found.</p></div>';
      return;
    }

    grid.innerHTML = '';
    products.forEach(p => {
      const card = renderProductCard(p, false, null);
      // Manager cannot delete approved items, only view
      card.querySelector('.product-card-footer')?.remove();
      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = '<div class="empty-state"><p>Error searching catalog.</p></div>';
  }
}
