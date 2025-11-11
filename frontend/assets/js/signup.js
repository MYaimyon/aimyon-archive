document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signupForm');
  const usernameEl = document.getElementById('suUsername');
  const displayEl = document.getElementById('suDisplayName');
  const emailEl = document.getElementById('suEmail');
  const phoneEl = document.getElementById('suPhone');
  const birthEl = document.getElementById('suBirth');
  const pwEl = document.getElementById('suPw');
  const pwConfirmEl = document.getElementById('suPwConfirm');
  const termsEl = document.getElementById('agreeTerms');
  const privacyEl = document.getElementById('agreePrivacy');
  const marketingEl = document.getElementById('agreeMarketing');
  const statusEl = document.getElementById('signupStatus');
  const usernameNote = document.getElementById('usernameNote');
  const passwordNote = document.getElementById('passwordRuleNote');
  const btnCheckUsername = document.getElementById('btnCheckUsername');
  const btnCheckEmail = document.getElementById('btnCheckEmail');

  let usernameChecked = false;
  let emailChecked = false;

  const setStatus = (msg, type) => {
    if (!statusEl) return;
    statusEl.textContent = msg || '';
    statusEl.className = 'compose-status' + (type ? ' ' + type : '');
  };

  const clearStatus = () => setStatus('', '');

  const getGender = () => {
    const checked = document.querySelector('input[name="suGender"]:checked');
    return checked ? checked.value : null;
  };

  const validatePasswordRules = (pw) => {
    const hasLetter = /[A-Za-z]/.test(pw);
    const hasDigit = /\d/.test(pw);
    const hasSpecial = /[^A-Za-z0-9]/.test(pw);
    return pw.length >= 8 && hasLetter && hasDigit && hasSpecial;
  };

  const updatePasswordNote = () => {
    const pw = pwEl.value;
    if (!pw) {
      passwordNote.textContent = '대문자는 선택이지만, 숫자와 특수문자는 반드시 포함해야 합니다.';
      passwordNote.style.color = 'var(--text-tertiary)';
      return;
    }
    if (validatePasswordRules(pw)) {
      passwordNote.textContent = '사용 가능한 비밀번호입니다.';
      passwordNote.style.color = '#65d26e';
    } else {
      passwordNote.textContent = '8자 이상, 숫자와 특수문자를 꼭 포함해야 합니다.';
      passwordNote.style.color = '#ff6b6b';
    }
  };

  pwEl.addEventListener('input', () => {
    updatePasswordNote();
  });

  usernameEl.addEventListener('input', () => {
    usernameChecked = false;
    usernameNote.textContent = '중복 확인을 눌러 사용 가능 여부를 확인하세요.';
    usernameNote.style.color = 'var(--text-tertiary)';
  });

  emailEl.addEventListener('input', () => {
    emailChecked = false;
  });

  btnCheckUsername.addEventListener('click', async () => {
    const username = usernameEl.value.trim();
    if (!username) {
      usernameNote.textContent = '아이디를 입력해주세요.';
      usernameNote.style.color = '#ff6b6b';
      return;
    }
    try {
      const res = await fetch(`/api/auth/check-username?value=${encodeURIComponent(username)}`);
      const data = await res.json();
      usernameChecked = data.available;
      if (data.available) {
        usernameNote.textContent = '사용 가능한 아이디입니다.';
        usernameNote.style.color = '#65d26e';
      } else {
        usernameNote.textContent = '이미 사용 중인 아이디입니다.';
        usernameNote.style.color = '#ff6b6b';
      }
    } catch {
      usernameNote.textContent = '중복 확인에 실패했습니다. 다시 시도해주세요.';
      usernameNote.style.color = '#ff6b6b';
    }
  });

  btnCheckEmail.addEventListener('click', async () => {
    const email = emailEl.value.trim();
    if (!email) {
      setStatus('이메일을 입력해주세요.', 'error');
      return;
    }
    try {
      const res = await fetch(`/api/auth/check-email?value=${encodeURIComponent(email)}`);
      const data = await res.json();
      emailChecked = data.available;
      if (data.available) {
        setStatus('사용 가능한 이메일입니다.', 'success');
      } else {
        setStatus('이미 사용 중인 이메일입니다.', 'error');
      }
    } catch {
      setStatus('이메일 확인에 실패했습니다.', 'error');
    }
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearStatus();

    const username = usernameEl.value.trim();
    const displayName = displayEl.value.trim();
    const email = emailEl.value.trim();
    const phone = phoneEl.value.trim();
    const birth = birthEl.value || null;
    const password = pwEl.value;
    const passwordConfirm = pwConfirmEl.value;
    const gender = getGender();

    if (!usernameChecked) {
      setStatus('아이디 중복 확인을 해주세요.', 'error');
      return;
    }
    if (!emailChecked) {
      setStatus('이메일 중복 확인을 해주세요.', 'error');
      return;
    }
    if (!validatePasswordRules(password)) {
      setStatus('비밀번호 규칙을 다시 확인해주세요.', 'error');
      return;
    }
    if (password !== passwordConfirm) {
      setStatus('비밀번호가 일치하지 않습니다.', 'error');
      return;
    }
    if (!termsEl.checked || !privacyEl.checked) {
      setStatus('필수 약관에 모두 동의해주세요.', 'error');
      return;
    }

    const payload = {
      username,
      email,
      password,
      displayName,
      phoneNumber: phone || null,
      birthDate: birth,
      gender,
      marketingOptIn: marketingEl.checked,
      agreeTerms: termsEl.checked,
      agreePrivacy: privacyEl.checked
    };

    setStatus('가입 처리 중...', '');
    try {
      const res = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('register failed');
      const data = await res.json();
      Auth.set(data);
      setStatus('가입이 완료되었습니다! 잠시 후 이동합니다.', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 800);
    } catch (err) {
      console.error(err);
      setStatus('가입에 실패했습니다. 입력 정보를 다시 확인해주세요.', 'error');
    }
  });
});
