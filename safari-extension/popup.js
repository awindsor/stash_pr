document.addEventListener('DOMContentLoaded', async () => {
  const authView = document.getElementById('auth-view');
  const mainView = document.getElementById('main-view');
  const authForm = document.getElementById('auth-form');
  const authError = document.getElementById('auth-error');
  const signinBtn = document.getElementById('signin-btn');
  const signupBtn = document.getElementById('signup-btn');
  const signoutBtn = document.getElementById('signout-btn');
  const savePageBtn = document.getElementById('save-page-btn');
  const savesList = document.getElementById('saves-list');
  const openAppLink = document.getElementById('open-app-link');

  const stored = await browser.storage.local.get(['stash_session']);
  if (stored.stash_session) {
    showMainView();
    loadRecentSaves();
  } else {
    showAuthView();
  }

  function showAuthView() {
    authView.classList.remove('hidden');
    mainView.classList.add('hidden');
  }

  function showMainView() {
    authView.classList.add('hidden');
    mainView.classList.remove('hidden');
  }

  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    signinBtn.disabled = true;
    signinBtn.textContent = 'Signing in...';
    authError.textContent = '';
    const response = await browser.runtime.sendMessage({action:'signIn', email, password});
    if (response.success) {
      showMainView();
      loadRecentSaves();
    } else {
      authError.textContent = response.error || 'Sign in failed';
      signinBtn.disabled = false;
      signinBtn.textContent = 'Sign In';
    }
  });

  signupBtn.addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (!email || !password) {
      authError.textContent = 'Please enter email and password';
      return;
    }
    signupBtn.disabled = true;
    signupBtn.textContent = 'Signing up...';
    authError.textContent = '';
    const response = await browser.runtime.sendMessage({action:'signUp', email, password});
    if (response.success) {
      authError.textContent = 'Account created! Please sign in.';
      signupBtn.disabled = false;
      signupBtn.textContent = 'Sign Up';
    } else {
      authError.textContent = response.error || 'Sign up failed';
      signupBtn.disabled = false;
      signupBtn.textContent = 'Sign Up';
    }
  });

  signoutBtn.addEventListener('click', async () => {
    await browser.runtime.sendMessage({action:'signOut'});
    showAuthView();
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
  });

  savePageBtn.addEventListener('click', async () => {
    savePageBtn.disabled = true;
    savePageBtn.textContent = 'Saving...';
    const response = await browser.runtime.sendMessage({action:'savePage'});
    if (response.success) {
      savePageBtn.textContent = 'Saved!';
      setTimeout(() => {
        savePageBtn.textContent = 'Save This Page';
        loadRecentSaves();
      }, 1500);
    } else {
      savePageBtn.textContent = 'Save This Page';
      alert('Failed: ' + (response.error || 'Unknown error'));
    }
    savePageBtn.disabled = false;
  });

  async function loadRecentSaves() {
    const response = await browser.runtime.sendMessage({action:'getRecentSaves'});
    if (!response.success || !response.saves?.length) {
      savesList.innerHTML = '<p>No saves yet</p>';
      return;
    }
    savesList.innerHTML = response.saves.map(save => {
      const date = new Date(save.created_at).toLocaleDateString();
      return `<div class="save-item" data-url="${save.url}"><strong>${save.title || 'Untitled'}</strong><br><small>${date}</small></div>`;
    }).join('');
    savesList.querySelectorAll('.save-item').forEach(item => {
      item.addEventListener('click', () => {
        if (item.dataset.url) browser.tabs.create({ url: item.dataset.url });
      });
    });
  }

  openAppLink.addEventListener('click', (e) => {
    e.preventDefault();
    browser.tabs.create({ url: CONFIG.WEB_APP_URL });
  });
});
