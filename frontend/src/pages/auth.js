import { authApi } from '../api/auth.js';
import { dealersApi } from '../api/dealers.js';
import { store } from '../state/store.js';
import { showToast } from '../components/toast.js';

let selectedRole = 'dealer';

export function renderLoginPage(container) {
  container.innerHTML = `
    <div class="form-container">
      <h2>Welcome Back</h2>
      <p class="subtitle">Select your account role to continue</p>
      
      <div class="role-tabs">
        <button class="role-tab active" data-role="dealer" id="tab-dealer">
          <span class="role-icon">🏪</span> Dealer
        </button>
        <button class="role-tab" data-role="manager" id="tab-manager">
          <span class="role-icon">🛡️</span> Manager
        </button>
        <button class="role-tab" data-role="admin" id="tab-admin">
          <span class="role-icon">🔐</span> Admin
        </button>
      </div>

      <form id="login-form">
        <div class="form-group">
          <label>Email Address</label>
          <input id="login-email" type="email" placeholder="name@domain.com" required/>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input id="login-pass" type="password" placeholder="Your password" required/>
        </div>
        <button type="submit" class="form-submit" id="btn-login-submit">Sign In</button>
      </form>
      <div class="form-link">New supplier? <a id="link-to-register">Register your shop</a></div>
    </div>`;

  const tabs = [
    { id: 'tab-dealer', role: 'dealer' },
    { id: 'tab-manager', role: 'manager' },
    { id: 'tab-admin', role: 'admin' },
  ];

  tabs.forEach(t => {
    container.querySelector(`#${t.id}`)?.addEventListener('click', (e) => {
      selectedRole = t.role;
      container.querySelectorAll('.role-tab').forEach(tab => tab.classList.remove('active'));
      e.currentTarget.classList.add('active');
    });
  });

  container.querySelector('#login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = container.querySelector('#login-email').value.trim();
    const password = container.querySelector('#login-pass').value;
    const submitBtn = container.querySelector('#btn-login-submit');

    if (!email || !password) {
      showToast('Please enter both email and password.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    try {
      const data = await authApi.login(email, password, selectedRole);
      store.setSession(data.token, data.role, data.user);
      showToast(`Welcome back, ${data.user.name || data.user.shop_name || 'User'}!`, 'success');

      if (data.role === 'admin') {
        store.navigate('adminDashboard');
      } else if (data.role === 'manager') {
        store.navigate('managerDashboard');
      } else {
        store.navigate('dealerDashboard');
      }
    } catch (err) {
      showToast(err.message || 'Login failed.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    }
  });

  container.querySelector('#link-to-register')?.addEventListener('click', () => store.navigate('register'));
}

export function renderRegisterPage(container) {
  container.innerHTML = `
    <div class="form-container">
      <h2>Dealer Registration</h2>
      <p class="subtitle">Join Lakshmi Kubera's supplier network</p>
      
      <form id="register-form">
        <div class="form-row">
          <div class="form-group"><label>Contact Person Name</label><input id="reg-name" placeholder="Full Name" required/></div>
          <div class="form-group"><label>Shop / Business Name</label><input id="reg-shop" placeholder="e.g. Metro Railway Hardware" required/></div>
        </div>
        <div class="form-group"><label>Business Email</label><input id="reg-email" type="email" placeholder="shop@example.com" required/></div>
        <div class="form-group"><label>Password</label><input id="reg-pass" type="password" placeholder="At least 6 characters" required/></div>
        <div class="form-row">
          <div class="form-group"><label>10-Digit Phone</label><input id="reg-phone" placeholder="9876543210" required/></div>
          <div class="form-group"><label>City</label><input id="reg-city" placeholder="City of operation" required/></div>
        </div>
        <div class="form-group"><label>Full Shop Address</label><textarea id="reg-address" rows="2" placeholder="Complete address & landmark" required></textarea></div>
        <button type="submit" class="form-submit" id="btn-reg-submit">Submit Application</button>
      </form>
      <div class="form-link">Already registered? <a id="link-to-login">Login here</a></div>
    </div>`;

  container.querySelector('#register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: container.querySelector('#reg-name').value.trim(),
      shop_name: container.querySelector('#reg-shop').value.trim(),
      email: container.querySelector('#reg-email').value.trim(),
      password: container.querySelector('#reg-pass').value,
      phone: container.querySelector('#reg-phone').value.trim(),
      city: container.querySelector('#reg-city').value.trim(),
      address: container.querySelector('#reg-address').value.trim(),
    };

    const submitBtn = container.querySelector('#btn-reg-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      const data = await dealersApi.register(payload);
      showToast(data.message || 'Registration submitted! Awaiting admin approval.', 'success');
      setTimeout(() => store.navigate('login'), 2000);
    } catch (err) {
      showToast(err.message || 'Registration failed.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Application';
    }
  });

  container.querySelector('#link-to-login')?.addEventListener('click', () => store.navigate('login'));
}
