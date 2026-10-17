import { store } from '../state/store.js';
import { productsApi } from '../api/products.js';
import { categoriesApi } from '../api/categories.js';
import { showToast } from '../components/toast.js';
import { renderProductCard } from '../components/cards/productCard.js';

let cachedCategories = [];

export async function renderDealerDashboard(container) {
  const user = store.user;

  container.innerHTML = `
    <div class="welcome-bar">
      <div>Welcome back, <strong>${user?.shop_name || user?.name || 'Dealer'}</strong>! Manage your product listings below.</div>
      <div class="status-badge approved">Verified Supplier</div>
    </div>
    <div class="dashboard-container">
      <!-- Upload Section -->
      <div class="upload-box">
        <h3>📦 Upload New Product for Review</h3>
        <form id="dealer-upload-form">
          <div class="form-row">
            <div class="form-group">
              <label>Product Name</label>
              <input id="p-name" placeholder="e.g. Heavy Duty Wheelchair (Stainless Steel)" required/>
            </div>
            <div class="form-group">
              <label>Category</label>
              <select id="p-category" required>
                <option value="">Loading categories...</option>
              </select>
              <div id="custom-cat-box" class="custom-category-reveal">
                <label style="font-size:12px; color:#c084fc;">Enter Custom Category Name:</label>
                <input id="p-custom-cat" placeholder="e.g. Solar Track Signaling" style="margin-top:4px;"/>
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Price (₹)</label>
              <input id="p-price" type="number" step="0.01" placeholder="Unit price in INR" required/>
            </div>
            <div class="form-group">
              <label>Product Photo</label>
              <input id="p-image" type="file" accept="image/*"/>
            </div>
          </div>
          <div class="form-group">
            <label>Technical Specifications / Brand / Dimensions</label>
            <textarea id="p-desc" rows="2" placeholder="Specifications, warranty, model number..."></textarea>
          </div>
          <button type="submit" class="btn-primary" id="btn-upload-submit">🚀 Submit for Manager Approval</button>
        </form>
      </div>

      <div class="section-top">
        <h2>My Uploaded Products</h2>
      </div>
      <div id="dealer-my-products-list" class="products-grid">
        <div class="loading-spinner"></div>
      </div>
    </div>`;

  // Load Categories into dropdown
  const categorySelect = container.querySelector('#p-category');
  const customCatBox = container.querySelector('#custom-cat-box');

  categorySelect.addEventListener('change', (e) => {
    customCatBox.style.display = e.target.value === '__custom__' ? 'block' : 'none';
  });

  try {
    cachedCategories = await categoriesApi.list();
    categorySelect.innerHTML = '<option value="">Select a category...</option>' +
      cachedCategories.map(c => `<option value="${c.name}">${c.name} ${c.is_inbuilt ? '' : '(Custom)'}</option>`).join('') +
      '<option value="__custom__">➕ + Custom Category (Add New)...</option>';
  } catch (err) {
    categorySelect.innerHTML = '<option value="">Failed to load categories</option>';
  }

  // Upload Form Submission
  const uploadForm = container.querySelector('#dealer-upload-form');
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = container.querySelector('#p-name').value.trim();
    let category = container.querySelector('#p-category').value;
    const price = container.querySelector('#p-price').value;
    const description = container.querySelector('#p-desc').value.trim();
    const image = container.querySelector('#p-image').files[0];
    const submitBtn = container.querySelector('#btn-upload-submit');

    if (category === '__custom__') {
      category = container.querySelector('#p-custom-cat').value.trim();
      if (!category) {
        showToast('Please type a custom category name.', 'error');
        return;
      }
    }

    if (!name || !category || !price) {
      showToast('Please enter name, category, and price.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Uploading...';

    const form = new FormData();
    form.append('name', name);
    form.append('category', category);
    form.append('price', price);
    form.append('description', description);
    if (image) form.append('image', image);

    try {
      await productsApi.upload(form);
      showToast('Product uploaded! Sent to manager review queue.', 'success');
      uploadForm.reset();
      customCatBox.style.display = 'none';
      loadDealerProducts(container);
    } catch (err) {
      showToast(err.message || 'Upload failed.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '🚀 Submit for Manager Approval';
    }
  });

  // Load Products list
  loadDealerProducts(container);
}

async function loadDealerProducts(container) {
  const listContainer = container.querySelector('#dealer-my-products-list');
  if (!listContainer) return;

  listContainer.innerHTML = '<div class="loading-spinner"></div>';
  try {
    const products = await productsApi.getMyProducts();
    if (!products.length) {
      listContainer.innerHTML = '<div class="empty-state"><span class="icon">📦</span><p>No products yet. Upload your first product above!</p></div>';
      return;
    }

    listContainer.innerHTML = '';
    products.forEach(p => {
      const card = renderProductCard(p, true, async (productId) => {
        if (!confirm('Delete this product listing?')) return;
        try {
          await productsApi.deleteMyProduct(productId);
          showToast('Product deleted.', 'info');
          loadDealerProducts(container);
        } catch (err) {
          showToast(err.message || 'Delete failed.', 'error');
        }
      });
      listContainer.appendChild(card);
    });
  } catch (err) {
    listContainer.innerHTML = '<div class="empty-state"><p>Error connecting to backend.</p></div>';
  }
}
