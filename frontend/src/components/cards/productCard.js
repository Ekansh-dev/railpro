export function renderProductCard(p, isDealerOwner = false, onDelete = null) {
  const card = document.createElement('div');
  card.className = 'product-card';
  const dealer = p.dealers || {};

  card.innerHTML = `
    ${p.image_url ? `<img src="${p.image_url}" alt="${p.name}"/>` : `<div class="no-img">📦</div>`}
    <div class="product-card-body">
      <div class="product-card-top">
        <span class="category" style="color:var(--blue); font-size:11px; font-weight:700;">${p.category}</span>
        ${isDealerOwner ? `<span class="status-badge ${p.status}">${p.status}</span>` : ''}
      </div>
      <h3>${p.name}</h3>
      <div class="product-price">₹${Number(p.price).toLocaleString('en-IN')}</div>
      <div class="product-desc">${p.description || 'No description provided.'}</div>

      ${p.status === 'rejected' && p.rejection_reason ? `
        <div class="rejection-alert">
          <strong>Manager Note:</strong> ${p.rejection_reason}
        </div>
      ` : ''}

      ${!isDealerOwner && dealer.shop_name ? `
        <div class="dealer-info">
          🏪 <strong>${dealer.shop_name}</strong><br/>
          👤 ${dealer.name || ''} &nbsp;|&nbsp; 📍 ${dealer.city || ''}<br/>
          <div class="phone">📞 ${dealer.phone || 'N/A'}</div>
        </div>
      ` : ''}

      <div class="product-card-footer">
        ${isDealerOwner ? `
          <button class="btn-danger btn-delete-product" style="padding:6px 12px; font-size:12px;">🗑 Delete</button>
        ` : `
          <button class="btn-danger btn-moderate-product" style="padding:6px 12px; font-size:12px;">🗑 Moderate Item</button>
        `}
      </div>
    </div>`;

  const deleteBtn = card.querySelector('.btn-delete-product') || card.querySelector('.btn-moderate-product');
  if (deleteBtn && onDelete) {
    deleteBtn.addEventListener('click', () => onDelete(p.id));
  }

  return card;
}
