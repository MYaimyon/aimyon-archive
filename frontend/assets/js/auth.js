const Auth = (() => {
  const STORAGE_KEY = 'aimyonAuth';

  const load = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch { return null; }
  };

  const save = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const clear = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  const isLoggedIn = () => Boolean(load()?.token);

  const token = () => load()?.token || null;

  const user = () => load()?.user || null;

  const set = (payload) => {
    if (!payload || !payload.token) return;
    save({ token: payload.token, user: { id: payload.userId, username: payload.username, roles: payload.roles || [] } });
  };

  const logout = () => {
    clear();
    renderNavAuth();
  };

  const renderNavAuth = () => {
    const host = document.getElementById('navAuth');
    if (!host) return;
    const u = user();
    if (isLoggedIn() && u) {
      host.innerHTML = `
        <span class="nav-username">${escapeHtml(u.username)}</span>
        <button type="button" id="logoutBtn">로그아웃</button>
      `;
      document.getElementById('logoutBtn')?.addEventListener('click', () => {
        logout();
        // redirect to home
        window.location.href = 'index.html';
      });
    } else {
      host.innerHTML = `
        <a href="login.html">로그인</a>
        <a href="signup.html">회원가입</a>
      `;
    }
  };

  // Listen for header load
  document.addEventListener('component:loaded', (e) => {
    if (e?.detail?.path?.includes('header.html')) {
      renderNavAuth();
    }
  });

  // In case header was already loaded
  if (document.readyState !== 'loading') {
    renderNavAuth();
  } else {
    document.addEventListener('DOMContentLoaded', renderNavAuth);
  }

  const authHeader = () => (isLoggedIn() ? { Authorization: `Bearer ${token()}` } : {});

  return { isLoggedIn, token, user, set, logout, authHeader, renderNavAuth };
})();

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

