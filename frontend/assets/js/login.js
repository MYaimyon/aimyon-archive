// Login page script (UTF-8 safe, single copy)
(function(){
  const API_BASE = (() => {
    if (typeof window !== 'undefined' && window.APP_API_BASE != null) return window.APP_API_BASE;
    const h = location.hostname;
    const isLocal = h === 'localhost' || h === '127.0.0.1' || (h && h.endsWith('.local'));
    return isLocal ? 'http://localhost:8080' : '';
  })();

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const idEl = document.getElementById('loginId');
    const pwEl = document.getElementById('loginPw');
    const statusEl = document.getElementById('loginStatus');

    const setStatus = (msg, type) => {
      if (!statusEl) return;
      statusEl.textContent = msg || '';
      statusEl.className = 'compose-status' + (type ? ' ' + type : '');
    };

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const identity = (idEl?.value || '').trim();
      const password = (pwEl?.value || '').trim();
      if (!identity || !password) {
        setStatus('\uC544\uC774\uB514\uC640 \uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.', 'error');
        return;
      }
      setStatus('\uB85C\uADF8\uC778 \uC911...');

      try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usernameOrEmail: identity, password })
        });
        if (!res.ok) throw new Error('login failed');
        const payload = await res.json();
        // persist auth (fallback)
        try {
          localStorage.setItem('aimyonAuth', JSON.stringify({
            token: payload.token,
            user: { id: payload.userId, username: payload.username, roles: payload.roles || [] }
          }));
        } catch {}
        if (window.Auth && typeof Auth.set === 'function') Auth.set(payload);
        setStatus('\uB85C\uADF8\uC778 \uC131\uACF5! \uBA54\uC778\uC73C\uB85C \uC774\uB3D9\uD569\uB2C8\uB2E4.', 'success');
        setTimeout(() => { window.location.href = 'index.html'; }, 700);
      } catch (err) {
        console.error(err);
        setStatus('\uB85C\uADF8\uC778\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. \uC785\uB825 \uC815\uBCF4\uB97C \uD655\uC778\uD574 \uC8FC\uC138\uC694.', 'error');
      }
    });
  });
})();
