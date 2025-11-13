// Community Post Detail (clean, ASCII-safe)

const COMMUNITY_API_BASE = (() => {
  if (window.location.protocol === 'file:') return 'http://localhost:8080/api/community';
  const { protocol, hostname, port } = window.location;
  if (port && port !== '' && port !== '8080') return `${protocol}//${hostname}:8080/api/community`;
  return '/api/community';
})();

const COMMUNITY_POST_BASE = `${COMMUNITY_API_BASE}/posts`;
const COMMUNITY_COMMENT_BASE = `${COMMUNITY_API_BASE}/comments`;
const USER_ID_KEY = 'aimyonCommunityUserId';
const LIKE_STORAGE_PREFIX = 'aimyonCommunityLike_';

// Minimal mock (ASCII only) used when ?mock=1 or API fails
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
    status.error('게시글 ID가 없습니다.');
    if (el.content) el.content.innerHTML = '<p>게시글을 찾을 수 없습니다.</p>';
    return;
  }

  const getAuthUser = () => (typeof Auth !== 'undefined' && typeof Auth.user === 'function') ? Auth.user() : null;
  const getAuthHeader = () => (typeof Auth !== 'undefined' && typeof Auth.authHeader === 'function') ? Auth.authHeader() : {};
  const isAdminUser = () => {
    const au = getAuthUser();
    const roles = (au && (au.roles || au.authorities)) || [];
    return Array.isArray(roles) && roles.some((r) => String(r).toUpperCase().includes('ADMIN'));
  };
  const loadAuthLocal = () => { try { const raw = localStorage.getItem('aimyonAuth'); return raw ? JSON.parse(raw) : null; } catch { return null; } };

  const getOrCreateUserId = () => {
    const stored = localStorage.getItem(USER_ID_KEY);
    if (stored && Number.isInteger(Number(stored))) return Number(stored);
    const id = Math.floor(Math.random() * 900000) + 100000;
    localStorage.setItem(USER_ID_KEY, String(id));
    return id;
  };
  const USER_ID = getOrCreateUserId();

  const currentUserName = () => {
    const au = getAuthUser();
    if (au?.username) return au.username;
    const local = loadAuthLocal();
    if (local?.user?.username) return local.user.username;
    return `#${USER_ID}`;
  };
  if (el.writerLabel) el.writerLabel.textContent = currentUserName();

  const likeStorageKey = `${LIKE_STORAGE_PREFIX}${postId}`;
  let currentPost = null;
  let currentComments = [];
  let usingMock = preferMock;
  let isLiked = localStorage.getItem(likeStorageKey) === 'true';

  const pickMockPost = (id) => (MOCK_POSTS[id] ? JSON.parse(JSON.stringify(MOCK_POSTS[id])) : null);
  const pickMockComments = (id) => (MOCK_COMMENTS[id] ? JSON.parse(JSON.stringify(MOCK_COMMENTS[id])) : []);

  const updateCommentCounts = (count) => {
    const n = Number.isFinite(count) ? count : 0;
    if (el.cmtMeta) el.cmtMeta.textContent = n;
    const totalLabel = document.getElementById('commentTotalLabel');
    if (totalLabel) totalLabel.innerHTML = `전체 댓글 <strong>${n}</strong>개`;
  };

  const updateLikeButton = () => {
    const count = currentPost?.likeCount ?? 0;
    const icon = isLiked ? '★' : '☆';
    const label = isLiked ? '추천 취소' : '추천';
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
    const { title, author, createdAt, content, viewCount, likeCount, commentCount } = currentPost;
    if (el.title) el.title.textContent = title || '제목 없음';
    if (el.author) el.author.textContent = author || '-';
    if (el.date) el.date.textContent = formatDateTime(createdAt);
    if (el.view) el.view.textContent = Number(viewCount ?? 0).toLocaleString();
    if (el.likeMeta) el.likeMeta.textContent = Number(likeCount ?? 0);
    updateCommentCounts(Number(commentCount ?? currentComments.length ?? 0));
    if (el.content) el.content.innerHTML = content || '<p>No content.</p>';
    updateLikeButton();

    const au = getAuthUser();
    const isOwner = au && currentPost && String(currentPost.userId || '') === String(au.id || '');
    const canDelete = Boolean(isOwner || isAdminUser());
    if (el.postDeleteButton) el.postDeleteButton.style.display = canDelete ? 'inline-block' : 'none';
  };

  const renderComments = () => {
    if (!el.cmtList) return;
    if (!currentComments.length) {
      el.cmtList.innerHTML = '<div class="community-empty"><p>등록된 댓글이 없습니다</p></div>';
      return;
    }
    el.cmtList.innerHTML = currentComments.map((c) => {
      const author = c.author || `회원 #${c.userId ?? '-'}`;
      const date = formatDateTime(c.createdAt);
      const body = escapeHtml(c.content || '').replace(/\n/g, '<br>');
      return `
        <article class="comment-card" data-comment-id="${c.id}">
          <header class="comment-meta">
            <span class="comment-author">${escapeHtml(author)}</span>
            <div class="comment-meta-right"><span class="comment-date">${date}</span></div>
          </header>
          <div class="comment-body">${body}</div>
        </article>`;
    }).join('');
  };

  const loadMockData = (fromFallback = false) => {
    const mp = pickMockPost(postId) || pickMockPost('mock-post-1001');
    if (!mp) { status.error('샘플 게시글을 찾을 수 없습니다.'); return; }
    usingMock = true;
    currentPost = mp;
    currentComments = pickMockComments(mp.id);
    status.message(fromFallback ? '게시글을 불러오지 못해 샘플 데이터를 보여줍니다.' : '샘플 데이터를 보여주는 중입니다.');
    renderPost();
    renderComments();
  };

  const loadPost = () => {
    if (preferMock) { loadMockData(false); return Promise.resolve(); }
    status.loading('게시글을 불러오는 중입니다...');
    return fetch(`${COMMUNITY_POST_BASE}/${encodeURIComponent(postId)}`, { headers: { Accept: 'application/json' } })
      .then((res) => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then((post) => { usingMock = false; currentPost = post; isLiked = Boolean(post.isLiked); renderPost(); status.clear(); })
      .catch(() => { loadMockData(true); });
  };

  const loadComments = () => {
    if (usingMock) { currentComments = pickMockComments(currentPost?.id); updateCommentCounts(currentComments.length); renderComments(); return; }
    if (!currentPost) return;
    commentStatus.loading('댓글을 불러오는 중입니다...');
    fetch(`${COMMUNITY_POST_BASE}/${encodeURIComponent(postId)}/comments`, { headers: { Accept: 'application/json' } })
      .then((res) => { if (!res.ok) throw new Error('comments failed'); return res.json(); })
      .then((comments) => { currentComments = Array.isArray(comments) ? comments : []; updateCommentCounts(currentComments.length); renderComments(); commentStatus.clear(); })
      .catch(() => { commentStatus.error('댓글을 불러오지 못했어요.'); currentComments = []; renderComments(); });
  };

  const submitComment = (e) => {
    e.preventDefault();
    if (!el.cmtInput || !el.cmtSubmit) return;
    const content = (el.cmtInput.value || '').trim();
    if (!content) return;
    el.cmtSubmit.disabled = true;
    if (usingMock) {
      currentComments.push({ id: `mock-${Date.now()}`, userId: USER_ID, author: currentUserName(), content, createdAt: new Date().toISOString() });
      el.cmtInput.value = '';
      updateCommentCounts(currentComments.length); renderComments(); commentStatus.message('샘플 댓글이 등록되었습니다.'); setTimeout(() => commentStatus.clear(), 1200); el.cmtSubmit.disabled = false; return;
    }
    const au = getAuthUser();
    const body = { postId, userId: au?.id ?? USER_ID, content };
    const headers = Object.assign({ 'Content-Type': 'application/json' }, getAuthHeader());
    fetch(`${COMMUNITY_COMMENT_BASE}`, { method: 'POST', headers, body: JSON.stringify(body) })
      .then((res) => { if (!res.ok) throw new Error('comment failed'); return res.json(); })
      .then(() => { el.cmtInput.value = ''; commentStatus.message('댓글이 등록되었습니다.'); loadComments(); setTimeout(() => commentStatus.clear(), 1200); })
      .catch(() => { commentStatus.error('댓글 등록 중 오류가 발생했습니다.'); })
      .finally(() => { el.cmtSubmit.disabled = false; });
  };

  const toggleLike = () => {
    if (!currentPost) return;
    isLiked = !isLiked;
    currentPost.likeCount = Math.max((currentPost.likeCount ?? 0) + (isLiked ? 1 : -1), 0);
    localStorage.setItem(likeStorageKey, String(isLiked));
    updateLikeButton();
  };

  const deletePost = () => {
    if (!currentPost || !postId) return;
    if (!confirm('이 게시글을 삭제할까요?')) return;
    const btn = el.postDeleteButton; if (btn) btn.disabled = true;
    if (usingMock) { status.message('샘플 게시글이 삭제되었습니다.'); setTimeout(() => { window.location.href = 'community.html'; }, 800); if (btn) btn.disabled = false; return; }
    const au = getAuthUser(); const userId = au?.id; const admin = isAdminUser();
    fetch(`${COMMUNITY_POST_BASE}/${encodeURIComponent(postId)}?userId=${encodeURIComponent(userId ?? '')}&admin=${String(admin)}`, { method: 'DELETE', headers: Object.assign({}, getAuthHeader()) })
      .then((res) => { if (!res.ok) { if (res.status === 403) throw new Error('forbidden'); throw new Error('delete failed'); } })
      .then(() => { status.message('게시글이 삭제되었습니다.'); setTimeout(() => { window.location.href = 'community.html'; }, 800); })
      .catch((err) => { if (String(err && err.message) === 'forbidden') alert('본인 글만 삭제할 수 있어요.'); else alert('게시글 삭제에 실패했습니다.'); })
      .finally(() => { if (btn) btn.disabled = false; });
  };

  if (el.likeBtn) el.likeBtn.addEventListener('click', toggleLike);
  if (el.shareBtn) el.shareBtn.addEventListener('click', () => {
    const shareData = { title: currentPost?.title || document.title, url: window.location.href };
    if (navigator.share) { navigator.share(shareData).catch(() => {}); return; }
    if (navigator.clipboard?.writeText) { navigator.clipboard.writeText(shareData.url).then(() => alert('링크가 복사되었습니다.')).catch(() => alert('링크 복사에 실패했습니다.')); }
    else { prompt('링크를 복사해 주세요', shareData.url); }
  });

  el.cmtForm?.addEventListener('submit', submitComment);
  el.postDeleteButton?.addEventListener('click', deletePost);

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
  return { loading(m){apply(m,'loading')}, message(m){apply(m,'')}, error(m){apply(m,'error')}, clear(){apply('','')} };
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

