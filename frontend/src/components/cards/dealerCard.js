export function renderDealerCard(d, onApprove, onReject) {
  const card = document.createElement('div');
  card.className = 'dealer-card';

  card.innerHTML = `
    <div class="dealer-card-header">
      <div>
        <h3>${d.shop_name}</h3>
        <span style="font-size:12px; color:var(--text-muted);">👤 ${d.name}</span>
      </div>
      <span class="status-badge ${d.status}">${d.status}</span>
    </div>
    <div class="dealer-contact">
      📞 <strong>${d.phone}</strong><br/>
      ✉️ ${d.email}<br/>
      📍 ${d.city} &mdash; ${d.address}
    </div>
    <div class="dealer-actions">
      ${d.status !== 'approved' ? `
        <button class="btn-emerald btn-approve-dealer">✅ Accept Dealer</button>
      ` : ''}
      ${d.status !== 'rejected' ? `
        <button class="btn-danger btn-reject-dealer">✕ Reject</button>
      ` : ''}
    </div>`;

  card.querySelector('.btn-approve-dealer')?.addEventListener('click', () => onApprove(d.id));
  card.querySelector('.btn-reject-dealer')?.addEventListener('click', () => onReject(d.id));

  return card;
}
