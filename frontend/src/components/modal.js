export function openModal(title, contentHtml) {
  const container = document.getElementById('modal-container');
  if (!container) return;

  container.innerHTML = `
    <div class="modal-backdrop" id="active-modal-backdrop">
      <div class="modal-box">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close" id="modal-close-btn">✕</button>
        </div>
        <div class="modal-body">${contentHtml}</div>
      </div>
    </div>`;

  document.getElementById('modal-close-btn')?.addEventListener('click', closeModal);
  document.getElementById('active-modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'active-modal-backdrop') closeModal();
  });
}

export function closeModal() {
  const container = document.getElementById('modal-container');
  if (container) container.innerHTML = '';
}
