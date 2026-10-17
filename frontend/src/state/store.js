/**
 * Global reactive state store
 */

class Store {
  constructor() {
    this.token = localStorage.getItem('token') || null;
    this.role = localStorage.getItem('role') || 'dealer';
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
    this.currentPage = 'home';
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }

  setSession(token, role, user) {
    this.token = token;
    this.role = role;
    this.user = user;
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('user', JSON.stringify(user));
    this.notify();
  }

  clearSession() {
    this.token = null;
    this.role = 'dealer';
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    this.navigate('home');
    this.notify();
  }

  navigate(pageId) {
    this.currentPage = pageId;
    this.notify();
  }

  isAuthenticated() {
    return !!this.token;
  }
}

export const store = new Store();
