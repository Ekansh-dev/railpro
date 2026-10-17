export function renderReviewCard(p, onApprove, onReject) {
  const card = document.createElement('div');
  card.className = 'product-card';
  const dealer = p.dealers || {};

  card.innerHTML = `
    ${p.image_url ? `<img src="${p.image_url}" alt="${p.name}"/>` : `<div class="no-img">📦</div>`}
    <div class="product-card-body">
      <div class="product-card-top">
        <span class="category" style="color:var(--purple); font-size:11px; font-weight:700;">${p.category}</span>
        <span class="status-badge pending">PENDING REVIEW</span>
      </div>
      <h3>${p.name}</h3>
      <div class="product-price">₹${Number(p.price).toLocaleString('en-IN')}</div>
      <div class="product-desc">${p.description || 'No description provided.'}</div>

      <div class="dealer-info">
        🏪 <strong>${dealer.shop_name || 'N/A'}</strong><br/>
        👤 ${dealer.name || ''} &nbsp;|&nbsp; 📍 ${dealer.city || ''}<br/>
        <div class="phone">📞 ${dealer.phone || 'N/A'}</div>
      </div>

      <div class="product-card-footer" style="margin-top:14px;">
        <button class="btn-emerald btn-approve-product">✅ Approve Product</button>
        <button class="btn-danger btn-reject-product">✕ Reject</button>
      </div>
    </div>`;

  card.querySelector('.btn-approve-product')?.addEventListener('click', () => onApprove(p.id));
  card.querySelector('.btn-reject-product')?.addEventListener('click', () => onReject(p.id));

  return card;
}
