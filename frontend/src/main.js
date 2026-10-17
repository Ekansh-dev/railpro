import './style.css';
import { store } from './state/store.js';
import { renderNavbar } from './components/navbar.js';
import { renderHomePage } from './pages/home.js';
import { renderLoginPage, renderRegisterPage } from './pages/auth.js';
import { renderDealerDashboard } from './pages/dealerDashboard.js';
import { renderAdminDashboard } from './pages/adminDashboard.js';
import { renderManagerDashboard } from './pages/managerDashboard.js';

function renderApp() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  appContainer.innerHTML = `
    <nav id="main-nav"></nav>
    <main id="main-content"></main>
  `;

  // Render Navbar
  const navContainer = document.getElementById('main-nav');
  renderNavbar(navContainer);

  // Render Current Page
  const contentContainer = document.getElementById('main-content');
  const page = store.currentPage;

  if (page === 'home') {
    renderHomePage(contentContainer);
  } else if (page === 'login') {
    renderLoginPage(contentContainer);
  } else if (page === 'register') {
    renderRegisterPage(contentContainer);
  } else if (page === 'dealerDashboard') {
    if (!store.isAuthenticated() || store.role !== 'dealer') {
      store.navigate('login');
      return;
    }
    renderDealerDashboard(contentContainer);
  } else if (page === 'adminDashboard') {
    if (!store.isAuthenticated() || store.role !== 'admin') {
      store.navigate('login');
      return;
    }
    renderAdminDashboard(contentContainer);
  } else if (page === 'managerDashboard') {
    if (!store.isAuthenticated() || store.role !== 'manager') {
      store.navigate('login');
      return;
    }
    renderManagerDashboard(contentContainer);
  } else {
    renderHomePage(contentContainer);
  }
}

// Initial route determination based on active token
if (store.isAuthenticated()) {
  if (store.role === 'admin') store.currentPage = 'adminDashboard';
  else if (store.role === 'manager') store.currentPage = 'managerDashboard';
  else store.currentPage = 'dealerDashboard';
}

// Subscribe to state changes
store.subscribe(() => {
  renderApp();
});

// Initial render
renderApp();