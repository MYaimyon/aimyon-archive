// Login page script (UTF-8 safe)
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
      const identity = (idEl.value || '').trim();
      const password = (pwEl.value || '').trim();
      if (!identity || !password) {
        setStatus('아이디와 비밀번호를 입력해 주세요.', 'error');
        return;
      }
      setStatus('로그인 중...');

      try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usernameOrEmail: identity, password })
        });
        if (!res.ok) throw new Error('login failed');
        const payload = await res.json();
        if (window.Auth && typeof Auth.set === 'function') Auth.set(payload);
        setStatus('로그인 성공! 메인으로 이동합니다.', 'success');
        setTimeout(() => { window.location.href = 'index.html'; }, 700);
      } catch (err) {
        console.error(err);
        setStatus('로그인에 실패했습니다. 입력 정보를 확인해 주세요.', 'error');
      }
    });
  });
})();