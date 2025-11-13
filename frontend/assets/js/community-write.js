const COMMUNITY_API_BASE = (() => {
  if (window.location.protocol === 'file:') return 'http://localhost:8080/api/community';
  const { protocol, hostname, port } = window.location;
  if (port && port !== '' && port !== '8080') return `${protocol}//${hostname}:8080/api/community`;
  return '/api/community';
})();

document.addEventListener('DOMContentLoaded', () => {
  const formEl = document.getElementById('communityComposeForm');
  const boardSelect = document.getElementById('composeBoard');
  const titleInput = document.getElementById('composeTitle');
  const contentInput = document.getElementById('composeContent');
  const statusEl = document.getElementById('composeStatus');
  const userIdEl = document.getElementById('composeUserId');
  const submitBtn = formEl?.querySelector('.compose-submit');

  const getAuthUser = () => (typeof Auth !== 'undefined' && typeof Auth.user === 'function') ? Auth.user() : null;
  const loadAuthLocal = () => { try { const raw = localStorage.getItem('aimyonAuth'); return raw ? JSON.parse(raw) : null; } catch { return null; } };
  const currentUser = () => getAuthUser() || (loadAuthLocal()?.user ?? null);
  const currentUserId = () => currentUser()?.id ?? null;
  const currentUserName = () => currentUser()?.username ?? '-';

  const setStatus = (message, type = 'info') => {
    if (!statusEl) return;
    statusEl.textContent = message || '';
    statusEl.className = 'compose-status';
    if (type === 'success') statusEl.classList.add('success');
    if (type === 'error') statusEl.classList.add('error');
  };

  const updateUserLabel = () => { if (userIdEl) userIdEl.textContent = currentUserName(); };
  updateUserLabel();
  window.addEventListener('storage', (e) => { if (e && e.key === 'aimyonAuth') { updateUserLabel(); enforceAuth(); } });
  document.addEventListener('component:loaded', (e) => { if (e?.detail?.path?.includes('header.html')) { setTimeout(updateUserLabel, 0); setTimeout(updateUserLabel, 50); } });

  const enforceAuth = () => {
    if (!currentUserId()) {
      submitBtn?.setAttribute('disabled', '');
      titleInput?.setAttribute('disabled', '');
      contentInput?.setAttribute('disabled', '');
      boardSelect?.setAttribute('disabled', '');
      setStatus('\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4. \uC624\uB978\uCABD \uC0C1\uB2E8\uC5D0\uC11C \uB85C\uADF8\uC778\uD574 \uC8FC\uC138\uC694.', 'error');
      return false;
    }
    submitBtn?.removeAttribute('disabled');
    titleInput?.removeAttribute('disabled');
    contentInput?.removeAttribute('disabled');
    boardSelect?.removeAttribute('disabled');
    setStatus('');
    return true;
  };
  enforceAuth();

  const populateBoards = () => {
    if (!boardSelect) return;
    boardSelect.innerHTML = '<option value="">\uAC8C\uC2DC\uD310\uC744 \uC120\uD0DD\uD558\uC138\uC694</option>';
    fetch(`${COMMUNITY_API_BASE}/boards`)
      .then((res) => res.json())
      .then((boards) => {
        if (!Array.isArray(boards) || boards.length === 0) {
          boardSelect.innerHTML = '<option value="" disabled>\uAC8C\uC2DC\uD310\uC774 \uC5C6\uC2B5\uB2C8\uB2E4</option>';
          boardSelect.disabled = true;
          return;
        }
        const options = boards.map((b) => `<option value="${b.slug}">${b.name}</option>`).join('');
        boardSelect.insertAdjacentHTML('beforeend', options);
        const requestedBoard = new URLSearchParams(window.location.search).get('board');
        if (requestedBoard && boards.some((b) => b.slug === requestedBoard)) boardSelect.value = requestedBoard;
        enforceAuth();
      })
      .catch(() => {
        // Fallback: static boards
        const fallback = [
          { slug: 'free', name: '\uC790\uC720\uAC8C\uC2DC\uD310' },
          { slug: 'pilgrimage', name: '\uC131\uC9C0\uC21C\uB840 \uC778\uC99D' }
        ];
        const options = fallback.map((b) => `<option value="${b.slug}">${b.name}</option>`).join('');
        boardSelect.innerHTML = '<option value="">\uAC8C\uC2DC\uD310\uC744 \uC120\uD0DD\uD558\uC138\uC694</option>' + options;
        boardSelect.disabled = false;
      });
  };
  populateBoards();

  formEl?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!boardSelect || !titleInput || !contentInput) return;
    if (!currentUserId()) { setStatus('\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.', 'error'); return; }

    const boardSlug = boardSelect.value.trim();
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!boardSlug) { setStatus('\uAC8C\uC2DC\uD310\uC744 \uC120\uD0DD\uD558\uC138\uC694.', 'error'); boardSelect.focus(); return; }
    if (!title || !content) { setStatus('\uC81C\uBAA9\uACFC \uB0B4\uC6A9\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.', 'error'); return; }

    setStatus('\uB4F1\uB85D \uC911\uC785\uB2C8\uB2E4...', '');
    submitBtn?.setAttribute('disabled', '');

    const extraHeaders = (typeof Auth !== 'undefined' && Auth.authHeader) ? Auth.authHeader() : {};
    fetch(`${COMMUNITY_API_BASE}/posts`, {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' }, extraHeaders),
      body: JSON.stringify({
        userId: currentUserId(),
        boardSlug,
        title,
        content
      })
    })
      .then((res) => { if (!res.ok) throw new Error('create failed'); return res.json(); })
      .then(() => {
        setStatus('\uAC8C\uC2DC\uAE00\uC774 \uB4F1\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4! \uBAA9\uB85D\uC73C\uB85C \uC774\uB3D9\uD569\uB2C8\uB2E4.', 'success');
        setTimeout(() => { window.location.href = `community.html?board=${encodeURIComponent(boardSlug)}`; }, 1200);
      })
      .catch(() => setStatus('\uAC8C\uC2DC\uAE00 \uC791\uC131\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.', 'error'))
      .finally(() => submitBtn?.removeAttribute('disabled'));
  });
});

