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
    const usernameOrEmail = idEl.value.trim();
    const password = pwEl.value.trim();
    if (!usernameOrEmail || !password) {
      setStatus('아이디/이메일과 비밀번호를 입력해 주세요.', 'error');
      return;
    }
    setStatus('로그인 시도 중...');

    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password })
      });
      if (!res.ok) throw new Error('login failed');
      const payload = await res.json();
      Auth.set(payload);
      setStatus('로그인 성공! 이동합니다...', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 600);
    } catch (err) {
      console.error(err);
      setStatus('로그인에 실패했습니다. 입력 정보를 확인해 주세요.', 'error');
    }
  });
});

