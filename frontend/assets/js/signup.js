document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signupForm');
  const nameEl = document.getElementById('suName');
  const emailEl = document.getElementById('suEmail');
  const pwEl = document.getElementById('suPw');
  const statusEl = document.getElementById('signupStatus');

  const setStatus = (msg, type) => {
    if (!statusEl) return;
    statusEl.textContent = msg || '';
    statusEl.className = 'compose-status' + (type ? ' ' + type : '');
  };

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = nameEl.value.trim();
    const email = emailEl.value.trim();
    const password = pwEl.value.trim();
    if (!username || !email || !password) {
      setStatus('모든 항목을 입력해 주세요.', 'error');
      return;
    }
    setStatus('가입 처리 중...');
    try {
      const res = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      if (!res.ok) throw new Error('register failed');
      const payload = await res.json();
      Auth.set(payload); // auto login
      setStatus('가입 완료! 로그인 상태로 이동합니다...', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 600);
    } catch (err) {
      console.error(err);
      setStatus('가입에 실패했습니다. 중복 아이디/이메일인지 확인해 주세요.', 'error');
    }
  });
});

