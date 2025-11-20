import { login, logout, isLoggedIn, getCurrentUser } from './supabase-client.js';

export function initAuth() {
  const loginModal = document.getElementById('login-modal');
  const loginForm = document.getElementById('login-form');
  const loginBtn = document.getElementById('confirm-login-btn');
  const cancelLoginBtn = document.getElementById('cancel-login-btn');
  const loginModalClose = document.getElementById('login-modal-close');
  const userIcon = document.getElementById('user-icon');
  const logoutBtn = document.getElementById('logout-btn');
  const appContent = document.getElementById('app-content');
  const loginError = document.getElementById('login-error');

  function showLoginModal() {
    loginModal.classList.add('active');
    document.getElementById('login-username').focus();
  }

  function hideLoginModal() {
    loginModal.classList.remove('active');
    loginForm.reset();
    if (loginError) loginError.textContent = '';
  }

  function showApp() {
    appContent.style.display = 'block';
    userIcon.style.display = 'flex';

    const user = getCurrentUser();
    if (user) {
      document.getElementById('user-name').textContent = user.username;
    }
  }

  function hideApp() {
    appContent.style.display = 'none';
    userIcon.style.display = 'none';
  }

  async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (loginError) loginError.textContent = '';

    const { data, error } = await login(username, password);

    if (error) {
      if (loginError) {
        loginError.textContent = error;
      } else {
        alert('Login failed: ' + error);
      }
      return;
    }

    hideLoginModal();
    showApp();

    window.dispatchEvent(new Event('user-logged-in'));
  }

  function handleLogout() {
    logout();
    hideApp();
    showLoginModal();

    window.dispatchEvent(new Event('user-logged-out'));
  }

  loginForm.addEventListener('submit', handleLogin);
  loginBtn.addEventListener('click', handleLogin);
  cancelLoginBtn.addEventListener('click', hideLoginModal);
  loginModalClose.addEventListener('click', hideLoginModal);
  logoutBtn.addEventListener('click', handleLogout);

  loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
      if (!isLoggedIn()) {
        e.stopPropagation();
      } else {
        hideLoginModal();
      }
    }
  });

  if (isLoggedIn()) {
    showApp();
  } else {
    hideApp();
    showLoginModal();
  }
}
