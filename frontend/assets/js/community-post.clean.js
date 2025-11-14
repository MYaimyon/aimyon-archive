// Community Post Detail (clean UTF-8 safe via Unicode escapes)
(function(){
  const COMMUNITY_API_BASE = (function(){
    if (window.location.protocol === 'file:') return 'http://localhost:8080/api/community';
    const { protocol, hostname, port } = window.location;
    if (port && port !== '' && port !== '8080') return protocol + '//' + hostname + ':8080/api/community';
    return '/api/community';
  })();
  const COMMUNITY_POST_BASE = COMMUNITY_API_BASE + '/posts';

  function createStatusManager(element, baseClass) {
    const base = baseClass || '';
    const apply = function(message, variant){
      if (!element) return;
      element.textContent = message;
      const classNames = [base];
      if (variant && message) classNames.push(variant);
      element.className = classNames.filter(Boolean).join(' ');
    };
    return {
      loading: function(m){ apply(m, 'loading'); },
      message: function(m){ apply(m, ''); },
      error: function(m){ apply(m, 'error'); },
      clear: function(){ apply('', ''); }
    };
  }
  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function formatDateTime(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mi = String(d.getMinutes()).padStart(2, '0');
      return yyyy + '.' + mm + '.' + dd + ' ' + hh + ':' + mi;
    } catch (_e) {
      return iso;
    }
  }
  function robustAuth(){
    try {
      if (typeof Auth !== 'undefined' && typeof Auth.user === 'function') {
        const u = Auth.user();
        let t = null;
        try {
          if (typeof Auth.token === 'function') t = Auth.token(); else if (Auth.token) t = Auth.token;
        } catch(_e) {}
        return { user: u || null, token: t };
      }
    } catch(_e) {}
    try {
      const raw = localStorage.getItem('aimyonAuth');
      if (raw) {
        const parsed = JSON.parse(raw);
        return { user: parsed.user || null, token: parsed.token || null };
      }
    } catch(_e) {}
    return { user: null, token: null };
  }
  function getAuthHeader(){
    const a = robustAuth();
    if (a && a.token) return { Authorization: 'Bearer ' + a.token };
    try {
      if (typeof Auth !== 'undefined' && typeof Auth.authHeader === 'function') return Auth.authHeader();
    } catch(_e) {}
    return {};
  }
  function isAdminUser(){
    const u = robustAuth().user;
    const roles = (u && (u.roles || u.authorities)) || [];
    return Array.isArray(roles) && roles.some(function(r){ return String(r).toUpperCase().indexOf('ADMIN') !== -1; });
  }

  document.addEventListener('DOMContentLoaded', function(){
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
      dislikeBtn: document.getElementById('dislikeButton'),
      shareLink: document.getElementById('shareLink'),
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

    const authUser = robustAuth().user;
    if (el.writerLabel) el.writerLabel.textContent = (authUser && (authUser.username || authUser.name)) || '-';

    const LIKE_STORAGE_PREFIX = 'aimyonCommunityLike_';
    const likeStorageKey = LIKE_STORAGE_PREFIX + postId;
    let isLiked = localStorage.getItem(likeStorageKey) === 'true';

    let currentPost = null;
    let currentComments = [];
    let usingMock = preferMock;

    function updateCommentCounts(count){
      const n = Number.isFinite(count) ? count : 0;
      if (el.cmtMeta) el.cmtMeta.textContent = n;
      const totalLabel = document.getElementById('commentTotalLabel');
      if (totalLabel) totalLabel.innerHTML = '\uC804\uCCB4 \uB313\uAE00 <strong>' + n + '</strong>\uAC1C';
    }

    function updateLikeButton(){
      if (!el.likeBtn) return;
      const n = Number(currentPost && currentPost.likeCount || 0);
      el.likeBtn.classList.toggle('liked', !!isLiked);
      if (el.likeMain) el.likeMain.textContent = n;
      if (el.likeMeta) el.likeMeta.textContent = n;
    }

    function renderPost(){
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
      const au = robustAuth().user;
      const isOwner = !!(au && currentPost && String(currentPost.userId || '') === String(au.id || ''));
      const canDelete = isOwner || isAdminUser();
      if (el.postDeleteButton) el.postDeleteButton.style.display = canDelete ? 'inline-block' : 'none';
    }

    function renderComments(){
      if (!el.cmtList) return;
      if (!currentComments.length) {
        el.cmtList.innerHTML = '<div class="community-empty"><p>No comments yet</p></div>';
        return;
      }
      el.cmtList.innerHTML = currentComments.map(function(c){
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
    }

    function loadMockData(fromFallback){
      usingMock = true;
      // minimal mock
      const mp = { id: postId || 'mock', title: 'Sample', author: 'User', createdAt: new Date().toISOString(), viewCount: 0, likeCount: 0, commentCount: 0, content: '<p>Mock content</p>', userId: 0 };
      currentPost = mp;
      currentComments = [];
      status.message(fromFallback ? 'Falling back to sample data.' : 'Showing sample data...');
      renderPost();
      renderComments();
    }

    function loadPost(){
      if (preferMock) { loadMockData(false); return Promise.resolve(); }
      status.loading('\uAC8C\uC2DC\uAE00\uC744 \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4...');
      return fetch(COMMUNITY_POST_BASE + '/' + encodeURIComponent(postId), { headers: { Accept: 'application/json' } })
        .then(function(res){ if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
        .then(function(post){ usingMock = false; currentPost = post; isLiked = !!post.isLiked; renderPost(); status.clear(); })
        .catch(function(){ loadMockData(true); });
    }

    function loadComments(){
      if (usingMock) { currentComments = []; updateCommentCounts(0); renderComments(); return; }
      if (!currentPost) return;
      commentStatus.loading('\uB313\uAE00\uC744 \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4...');
      fetch(COMMUNITY_POST_BASE + '/' + encodeURIComponent(postId) + '/comments', { headers: { Accept: 'application/json' } })
        .then(function(res){ if (!res.ok) throw new Error('comments failed'); return res.json(); })
        .then(function(comments){ currentComments = Array.isArray(comments) ? comments : []; updateCommentCounts(currentComments.length); renderComments(); commentStatus.clear(); })
        .catch(function(){ commentStatus.error('\uB313\uAE00\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC5B4\uC694.'); currentComments = []; renderComments(); });
    }

    function submitComment(e){
      e.preventDefault();
      if (!el.cmtInput || !el.cmtSubmit) return;
      const content = (el.cmtInput.value || '').trim();
      if (!content) return;
      const au = robustAuth().user;
      if (!(au && au.id)) { commentStatus.error('\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.'); return; }
      el.cmtSubmit.disabled = true;
      const body = { userId: au.id, parentCommentId: null, content: content };
      const headers = Object.assign({ 'Content-Type': 'application/json' }, getAuthHeader());
      fetch(COMMUNITY_POST_BASE + '/' + encodeURIComponent(postId) + '/comments', { method: 'POST', headers: headers, body: JSON.stringify(body) })
        .then(function(res){ if (!res.ok) throw new Error('comment failed ' + res.status); return res.json(); })
        .then(function(){ el.cmtInput.value = ''; commentStatus.message('\uB313\uAE00\uC774 \uB4F1\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4.'); loadComments(); setTimeout(function(){ commentStatus.clear(); }, 1200); })
        .catch(function(err){ console.warn('comment failed', err); commentStatus.error('\uB313\uAE00 \uB4F1\uB85D \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.'); })
        .finally(function(){ el.cmtSubmit.disabled = false; });
    }

    function toggleLike(){
      if (!currentPost) return;
      isLiked = !isLiked;
      currentPost.likeCount = Math.max((currentPost.likeCount || 0) + (isLiked ? 1 : -1), 0);
      localStorage.setItem(likeStorageKey, String(isLiked));
      updateLikeButton();
    }

    function deletePost(){
      if (!currentPost || !postId) return;
      if (!confirm('\uC774 \uAC8C\uC2DC\uAE00\uC744 \uC0AD\uC81C\uD560\uAE4C\uC694?')) return;
      const btn = el.postDeleteButton; if (btn) btn.disabled = true;
      if (usingMock) { status.message('\uC0D8\uD50C \uAC8C\uC2DC\uAE00\uC774 \uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4.'); setTimeout(function(){ window.location.href = 'community.html'; }, 800); if (btn) btn.disabled = false; return; }
      const au = robustAuth().user; const userId = au && au.id; const admin = isAdminUser();
      fetch(COMMUNITY_POST_BASE + '/' + encodeURIComponent(postId) + '?userId=' + encodeURIComponent(userId || '') + '&admin=' + String(admin), { method: 'DELETE', headers: Object.assign({}, getAuthHeader()) })
        .then(function(res){ if (!res.ok) { if (res.status === 403) throw new Error('forbidden'); throw new Error('delete failed'); } })
        .then(function(){ status.message('\uAC8C\uC2DC\uAE00\uC774 \uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4.'); setTimeout(function(){ window.location.href = 'community.html'; }, 800); })
        .catch(function(err){ if (String(err && err.message) === 'forbidden') alert('\uBCF8\uC778 \uAE00\uB9CC \uC0AD\uC81C\uD560 \uC218 \uC788\uC5B4\uC694.'); else alert('\uAC8C\uC2DC\uAE00 \uC0AD\uC81C\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.'); })
        .finally(function(){ if (btn) btn.disabled = false; });
    }

    if (el.likeBtn) el.likeBtn.addEventListener('click', toggleLike);

    (function(){
      const btn = el.dislikeBtn;
      if (!btn) return;
      const key = 'aimyonCommunityDislike_' + postId;
      let disliked = localStorage.getItem(key) === 'true';
      const valEl = btn.querySelector('#dislikeCount');
      const setUI = function(){ btn.classList.toggle('active', disliked); if (valEl) { const n = Number(valEl.textContent || 0); valEl.textContent = String(Math.max(0, n)); } };
      setUI();
      btn.addEventListener('click', function(){ disliked = !disliked; localStorage.setItem(key, String(disliked)); btn.classList.toggle('active', disliked); });
    })();

    (function(){
      const s = el.shareLink;
      if (!s) return;
      s.addEventListener('click', function(e){
        e.preventDefault();
        const url = window.location.href;
        if (navigator.share) { navigator.share({ title: document.title, url: url }).catch(function(){}); return; }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url)
            .then(function(){ alert('\uB9C1\uD06C\uAC00 \uBCF5\uC0AC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.'); })
            .catch(function(){ alert('\uB9C1\uD06C \uBCF5\uC0AC\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.'); });
        } else {
          prompt('\uB9C1\uD06C\uB97C \uBCF5\uC0AC\uD574 \uC8FC\uC138\uC694', url);
        }
      });
    })();

    if (el.cmtForm) el.cmtForm.addEventListener('submit', submitComment);
    if (el.postDeleteButton) el.postDeleteButton.addEventListener('click', deletePost);

    loadPost().then(function(){ loadComments(); }).catch(function(){ loadComments(); });
  });
})();
