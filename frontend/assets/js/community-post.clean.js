// Community Post Detail (clean ASCII + robust auth)

const COMMUNITY_API_BASE = (() => {
  if (window.location.protocol === 'file:') return 'http://localhost:8080/api/community';
  const { protocol, hostname, port } = window.location;
  if (port && port !== '' && port !== '8080') return `${protocol}//${hostname}:8080/api/community`;
  return '/api/community';
})();

const COMMUNITY_POST_BASE = `${COMMUNITY_API_BASE}/posts`;
const COMMUNITY_COMMENT_BASE = `${COMMUNITY_API_BASE}/comments`;
const LIKE_STORAGE_PREFIX = 'aimyonCommunityLike_';

const MOCK_POSTS = {
  'mock-post-1001': {
    id: 'mock-post-1001',
    board: 'free',
    title: 'Sample Post Title',
    author: 'UserOne',
    authorId: 102938,
    createdAt: '2024-10-20T10:15:00+09:00',
    updatedAt: '2024-10-20T11:00:00+09:00',
    viewCount: 128,
    likeCount: 12,
    commentCount: 4,
    content: '<p>This is a sample content for mock mode.</p>',
    tags: ['talk'],
    isNotice: false
  }
};

const MOCK_COMMENTS = {
  'mock-post-1001': [
    { id: 'c-1001-1', userId: 881122, author: 'CatSinger', content: 'Love this track!', createdAt: '2024-10-20T11:12:00+09:00' }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get('id');
  const preferMock = params.get('mock') === '1';

  const status = createStatusManager(document.getElementById('postStatus'), 'community-status');
  const commentStatus = createStatusManager(document.getElementById('commentStatus'), 'comment-status');

  const el = {
    title: document.getElementById('cpTitle'),
    author: document.getElementById('cpAuthor'),
    date: document.getElementById('cpDate'),
    view: document.getElementById('cpViewCount'),
    likeMain: document.getElementById('likeCount'),
    likeMeta: document.getElementById('cpLikeCountMeta'),
    cmtMeta: document.getElementById('cpCommentCountMeta'),
    content: document.getElementById('cpContent'),
    likeBtn: document.getElementById('likeButton'),
    shareBtn: document.getElementById('shareButton'),
    cmtList: document.getElementById('commentList'),
    cmtForm: document.getElementById('commentForm'),
    cmtInput: document.getElementById('commentInput'),
    cmtSubmit: document.querySelector('#commentForm [type="submit"]'),
    writerLabel: document.getElementById('commentWriterLabel'),
    postDeleteButton: document.getElementById('postDeleteButton')
  };

  if (!postId) {
    status.error('\uAC8C\uC2DC\uAE00 ID\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.');
    if (el.content) el.content.innerHTML = '<p>\uAC8C\uC2DC\uAE00\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.</p>';
    return;
  }

  const getAuthUser = () => (typeof Auth !== 'undefined' && typeof Auth.user === 'function') ? Auth.user() : null;
  const robustAuth = () => {
    const au = getAuthUser();
    if (au && au.id) { let t = null; try { if (typeof Auth !== 'undefined') { if (typeof Auth.token === 'function') t = Auth.token(); else if (Auth.token) t = Auth.token; } } catch {} return { user: au, token: t }; }
    try {
      const raw = localStorage.getItem('aimyonAuth');
      if (raw) {
        const parsed = JSON.parse(raw);
        return { user: parsed.user || null, token: parsed.token || null };
      }
    } catch {}
    return { user: null, token: null };
  };
  const getAuthHeader = () => {
    const a = robustAuth();
    if (a.token) return { Authorization: 'Bearer ' + a.token };
    if (typeof Auth !== 'undefined' && typeof Auth.authHeader === 'function') return Auth.authHeader();
    return {};
  };
  const isAdminUser = () => {
    const a = robustAuth().user;
    const roles = (a && (a.roles || a.authorities)) || [];
    return Array.isArray(roles) && roles.some((r) => String(r).toUpperCase().includes('ADMIN'));
  };

  const currentAuth = () => robustAuth().user;
  const hasUser = !!(currentAuth() && currentAuth().id);

  const likeStorageKey = `${LIKE_STORAGE_PREFIX}${postId}`;
  let currentPost = null;
  let currentComments = [];
  let usingMock = preferMock;
  let isLiked = localStorage.getItem(likeStorageKey) === 'true';

  // Comment UI state by auth
  if (!hasUser) {
    if (el.writerLabel && el.writerLabel.parentElement) el.writerLabel.parentElement.style.display = 'none';
    if (el.cmtInput) {
      el.cmtInput.disabled = true;
      el.cmtInput.placeholder = '\uB85C\uADF8\uC778\uD55C \uC0AC\uC6A9\uC790\uB9CC \uB313\uAE00\uC744 \uB2EC \uC218 \uC788\uC5B4\uC694.';
    }
    if (el.cmtSubmit) el.cmtSubmit.disabled = true;
  } else {
    if (el.writerLabel && el.writerLabel.parentElement) el.writerLabel.parentElement.style.display = '';
    if (el.writerLabel) el.writerLabel.textContent = (currentAuth() && currentAuth().username) || '-';
  }

  const pickMockPost = (id) => (MOCK_POSTS[id] ? JSON.parse(JSON.stringify(MOCK_POSTS[id])) : null);
  const pickMockComments = (id) => (MOCK_COMMENTS[id] ? JSON.parse(JSON.stringify(MOCK_COMMENTS[id])) : []);

  const updateCommentCounts = (count) => {
    const n = Number.isFinite(count) ? count : 0;
    if (el.cmtMeta) el.cmtMeta.textContent = n;
    const totalLabel = document.getElementById('commentTotalLabel');
    if (totalLabel) totalLabel.innerHTML = '\uC804\uCCB4 \uB313\uAE00 <strong>' + n + '</strong>\uAC1C';
  };

  const updateLikeButton = () => {
    const count = currentPost?.likeCount ?? 0;
    const icon = isLiked ? '\u2605' : '\u2606';
    const label = isLiked ? '\uCD94\uCC9C \uCDE8\uC18C' : '\uCD94\uCC9C';
    if (el.likeMain) el.likeMain.textContent = count;
    if (el.likeMeta) el.likeMeta.textContent = count;
    if (el.likeBtn) {
      el.likeBtn.dataset.liked = String(isLiked);
      const i = el.likeBtn.querySelector('.tile-icon');
      const t = el.likeBtn.querySelector('.tile-title');
      if (i) i.textContent = icon;
      if (t) t.textContent = label;
    }
  };

  const renderPost = () => {
    if (!currentPost) return;
    const title = currentPost.title || '\uC81C\uBAA9 \uC5C6\uC74C';
    const author = currentPost.author || '-';
    const createdAt = currentPost.createdAt;
    const viewCount = Number(currentPost.viewCount || 0);
    const likeCount = Number(currentPost.likeCount || 0);
    const commentCount = Number((currentPost.commentCount || (currentComments ? currentComments.length : 0)) || 0);
    if (el.title) el.title.textContent = title;
    if (el.author) el.author.textContent = author;
    if (el.date) el.date.textContent = formatDateTime(createdAt);
    if (el.view) el.view.textContent = viewCount.toLocaleString();
    if (el.likeMeta) el.likeMeta.textContent = likeCount;
    updateCommentCounts(commentCount);
    if (el.content) el.content.innerHTML = currentPost.content || '<p>No content.</p>';
    updateLikeButton();
    const au = currentAuth();
    const isOwner = !!(au && currentPost && String(currentPost.userId || '') === String(au.id || ''));
    const canDelete = isOwner || isAdminUser();
    if (el.postDeleteButton) el.postDeleteButton.style.display = canDelete ? 'inline-block' : 'none';
  };

  const renderComments = () => {
    if (!el.cmtList) return;
    if (!currentComments.length) {
      el.cmtList.innerHTML = '<div class="community-empty"><p>No comments yet</p></div>';
      return;
    }
    el.cmtList.innerHTML = currentComments.map((c) => {
      const author = c.author || ('Member #' + (c.userId == null ? '-' : c.userId));
      const date = formatDateTime(c.createdAt);
      const body = escapeHtml(c.content || '').replace(/\n/g, '<br>');
      return (
        '<article class="comment-card" data-comment-id="' + c.id + '">' +
        '<header class="comment-meta">' +
        '<span class="comment-author">' + escapeHtml(author) + '</span>' +
        '<div class="comment-meta-right"><span class="comment-date">' + date + '</span></div>' +
        '</header>' +
        '<div class="comment-body">' + body + '</div>' +
        '</article>'
      );
    }).join('');
  };

  const loadMockData = (fromFallback) => {
    const mp = pickMockPost(postId) || pickMockPost('mock-post-1001');
    if (!mp) { status.error('Sample post not found.'); return; }
    usingMock = true;
    currentPost = mp;
    currentComments = pickMockComments(mp.id);
    status.message(fromFallback ? 'Falling back to sample data.' : 'Showing sample data...');
    renderPost();
    renderComments();
  };

  const loadPost = () => {
    if (preferMock) { loadMockData(false); return Promise.resolve(); }
    status.loading('\uAC8C\uC2DC\uAE00\uC744 \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4...');
    return fetch(`${COMMUNITY_POST_BASE}/${encodeURIComponent(postId)}`, { headers: { Accept: 'application/json' } })
      .then((res) => { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then((post) => { usingMock = false; currentPost = post; isLiked = !!post.isLiked; renderPost(); status.clear(); })
      .catch(() => { loadMockData(true); });
  };

  const loadComments = () => {
    if (usingMock) { currentComments = pickMockComments(currentPost && currentPost.id); updateCommentCounts(currentComments.length); renderComments(); return; }
    if (!currentPost) return;
    commentStatus.loading('\uB313\uAE00\uC744 \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4...');
    fetch(`${COMMUNITY_POST_BASE}/${encodeURIComponent(postId)}/comments`, { headers: { Accept: 'application/json' } })
      .then((res) => { if (!res.ok) throw new Error('comments failed'); return res.json(); })
      .then((comments) => { currentComments = Array.isArray(comments) ? comments : []; updateCommentCounts(currentComments.length); renderComments(); commentStatus.clear(); })
      .catch(() => { commentStatus.error('\uB313\uAE00\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC5B4\uC694.'); currentComments = []; renderComments(); });
  };

  const submitComment = (e) => {
    e.preventDefault();
    if (!el.cmtInput || !el.cmtSubmit) return;
    const content = (el.cmtInput.value || '').trim();
    if (!content) return;
    const au = currentAuth();
    if (!(au && au.id)) { commentStatus.error('\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.'); return; }
    el.cmtSubmit.disabled = true;
    const body = { userId: au.id, parentCommentId: null, content };
    const headers = Object.assign({ 'Content-Type': 'application/json' }, getAuthHeader());
    fetch(`${COMMUNITY_POST_BASE}/${encodeURIComponent(postId)}/comments`, { method: 'POST', headers, body: JSON.stringify(body) })
      .then((res) => { if (!res.ok) throw new Error('comment failed ' + res.status); return res.json(); })
      .then(() => { el.cmtInput.value = ''; commentStatus.message('\uB313\uAE00\uC774 \uB4F1\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4.'); loadComments(); setTimeout(() => commentStatus.clear(), 1200); })
      .catch((err) => { console.warn('comment failed', err); commentStatus.error('\uB313\uAE00 \uB4F1\uB85D \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.'); })
      .finally(() => { el.cmtSubmit.disabled = false; });
  };

  const toggleLike = () => {
    if (!currentPost) return;
    isLiked = !isLiked;
    currentPost.likeCount = Math.max((currentPost.likeCount || 0) + (isLiked ? 1 : -1), 0);
    localStorage.setItem(likeStorageKey, String(isLiked));
    updateLikeButton();
  };

  const deletePost = () => {
    if (!currentPost || !postId) return;
    if (!confirm('\uC774 \uAC8C\uC2DC\uAE00\uC744 \uC0AD\uC81C\uD560\uAE4C\uC694?')) return;
    const btn = el.postDeleteButton; if (btn) btn.disabled = true;
    if (usingMock) { status.message('\uC0D8\uD50C \uAC8C\uC2DC\uAE00\uC774 \uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4.'); setTimeout(() => { window.location.href = 'community.html'; }, 800); if (btn) btn.disabled = false; return; }
    const au = currentAuth(); const userId = au && au.id; const admin = isAdminUser();
    fetch(`${COMMUNITY_POST_BASE}/${encodeURIComponent(postId)}?userId=${encodeURIComponent(userId || '')}&admin=${String(admin)}`, { method: 'DELETE', headers: Object.assign({}, getAuthHeader()) })
      .then((res) => { if (!res.ok) { if (res.status === 403) throw new Error('forbidden'); throw new Error('delete failed'); } })
      .then(() => { status.message('\uAC8C\uC2DC\uAE00\uC774 \uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4.'); setTimeout(() => { window.location.href = 'community.html'; }, 800); })
      .catch((err) => { if (String(err && err.message) === 'forbidden') alert('\uBCF8\uC778 \uAE00\uB9CC \uC0AD\uC81C\uD560 \uC218 \uC788\uC5B4\uC694.'); else alert('\uAC8C\uC2DC\uAE00 \uC0AD\uC81C\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.'); })
      .finally(() => { if (btn) btn.disabled = false; });
  };

  if (el.likeBtn) el.likeBtn.addEventListener('click', toggleLike);
  if (el.shareBtn) el.shareBtn.addEventListener('click', () => {
    const shareData = { title: (currentPost && currentPost.title) || document.title, url: window.location.href };
    if (navigator.share) { navigator.share(shareData).catch(() => {}); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareData.url)
        .then(() => alert('\uB9C1\uD06C\uAC00 \uBCF5\uC0AC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.'))
        .catch(() => alert('\uB9C1\uD06C \uBCF5\uC0AC\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.'));
    } else {
      prompt('\uB9C1\uD06C\uB97C \uBCF5\uC0AC\uD574 \uC8FC\uC138\uC694', shareData.url);
    }
  });

  el.cmtForm && el.cmtForm.addEventListener('submit', submitComment);
  el.postDeleteButton && el.postDeleteButton.addEventListener('click', deletePost);

  loadPost().then(() => loadComments()).catch(() => loadComments());
});

function createStatusManager(element, baseClass) {
  const base = baseClass || '';
  const apply = (message, variant) => {
    if (!element) return;
    element.textContent = message;
    const classNames = [base];
    if (variant && message) classNames.push(variant);
    element.className = classNames.filter(Boolean).join(' ');
  };
  return { loading: (m) => apply(m, 'loading'), message: (m) => apply(m, ''), error: (m) => apply(m, 'error'), clear: () => apply('', '') };
}

function formatDateTime(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso); if (Number.isNaN(d.getTime())) return iso;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd} ${hh}:${mi}`;
  } catch { return iso; }
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
