const COMMUNITY_API_BASE = (() => {
  if (window.location.protocol === "file:") {
    return "http://localhost:8080/api/community";
  }
  const { protocol, hostname, port } = window.location;
  if (port && port !== "" && port !== "8080") {
    return `${protocol}//${hostname}:8080/api/community`;
  }
  return "/api/community";
})();

const COMMUNITY_POST_BASE = `${COMMUNITY_API_BASE}/posts`;
const COMMUNITY_COMMENT_BASE = `${COMMUNITY_API_BASE}/comments`;
const USER_ID_STORAGE_KEY = "aimyonCommunityUserId";
const LIKE_STORAGE_PREFIX = "aimyonCommunityLike_";

const MOCK_POSTS = {
  "mock-post-1001": {
    id: "mock-post-1001",
    board: "free",
    title: "처음 Aimyon에 빠진 순간",
    author: "미도리",
    authorId: 102938,
    createdAt: "2024-10-20T10:15:00+09:00",
    updatedAt: "2024-10-20T11:00:00+09:00",
    viewCount: 128,
    likeCount: 12,
    commentCount: 4,
    content:
      "<p>중학생 때 <em>Marigold</em>를 듣고 빠졌어요. 그날부터 Aimyon을 찾아 들었습니다. 최근 세트리스트도 훨씬 다양해져서 감동!</p><p>여러분은 어떤 곡으로 Aimyon을 좋아하게 되었나요?</p>",
    tags: ["수다"],
    isNotice: false
  }
};

const MOCK_COMMENTS = {
  "mock-post-1001": [
    {
      id: "c-1001-1",
      userId: 881122,
      author: "노래부르는고양이",
      content: "愛を伝えたいだとか 듣고 빠졌어요!",
      createdAt: "2024-10-20T11:12:00+09:00"
    }
  ]
};

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");
  const preferMock = params.get("mock") === "1";

  const status = createStatusManager(document.getElementById("postStatus"), "community-status");
  const commentStatus = createStatusManager(document.getElementById("commentStatus"), "comment-status");

  const elements = {
    title: document.getElementById("cpTitle"),
    author: document.getElementById("cpAuthor"),
    date: document.getElementById("cpDate"),
    viewCount: document.getElementById("cpViewCount"),
    likeCountMain: document.getElementById("likeCount"),
    likeCountMeta: document.getElementById("cpLikeCountMeta"),
    commentCountMeta: document.getElementById("cpCommentCountMeta"),
    commentTotalLabel: document.getElementById("commentTotalLabel"),
    content: document.getElementById("cpContent"),
    likeButton: document.getElementById("likeButton"),
    shareButton: document.getElementById("shareButton"),
    commentList: document.getElementById("commentList"),
    commentForm: document.getElementById("commentForm"),
    commentInput: document.getElementById("commentInput"),
    commentSubmit: document.querySelector("#commentForm [type=\"submit\"]"),
    commentWriterLabel: document.getElementById("commentWriterLabel")
  };

  if (!postId) {
    status.error("요청한 게시글 ID가 없습니다.");
    if (elements.content) {
      elements.content.innerHTML = "<p>게시글을 찾을 수 없습니다.</p>";
    }
    return;
  }

  const getAuthUser = () => (typeof Auth !== 'undefined' && typeof Auth.user === 'function') ? Auth.user() : null;
  const loadAuthLocal = () => { try { const raw = localStorage.getItem('aimyonAuth'); return raw ? JSON.parse(raw) : null; } catch { return null; } };
  const getOrCreateUserId = () => {
    const stored = localStorage.getItem(USER_ID_STORAGE_KEY);
    if (stored && Number.isInteger(Number(stored))) {
      return Number(stored);
    }
    const randomId = Math.floor(Math.random() * 900000) + 100000;
    localStorage.setItem(USER_ID_STORAGE_KEY, String(randomId));
    return randomId;
  };
  const USER_ID = getOrCreateUserId();

  const currentUserName = () => {
    const au = getAuthUser();
    if (au?.username) return au.username;
    const local = loadAuthLocal();
    if (local?.user?.username) return local.user.username;
    return `#${USER_ID}`;
  };
  if (elements.commentWriterLabel) {
    elements.commentWriterLabel.textContent = currentUserName();
  }

  const likeStorageKey = `${LIKE_STORAGE_PREFIX}${postId}`;
  let currentPost = null;
  let currentComments = [];
  let usingMock = preferMock;
  let isLiked = localStorage.getItem(likeStorageKey) === "true";

  const pickMockPost = (id) => {
    if (id && Object.prototype.hasOwnProperty.call(MOCK_POSTS, id)) {
      return JSON.parse(JSON.stringify(MOCK_POSTS[id]));
    }
    const all = Object.values(MOCK_POSTS);
    return all.length ? JSON.parse(JSON.stringify(all[0])) : null;
  };

  const pickMockComments = (id) => {
    if (id && Object.prototype.hasOwnProperty.call(MOCK_COMMENTS, id)) {
      return JSON.parse(JSON.stringify(MOCK_COMMENTS[id]));
    }
    return [];
  };

  const updateCommentCounts = (count) => {
    const value = Number.isFinite(count) ? count : 0;
    if (elements.commentCountMeta) {
      elements.commentCountMeta.textContent = value;
    }
    if (elements.commentTotalLabel) {
      elements.commentTotalLabel.innerHTML = `전체 댓글 <strong>${value}</strong>개`;
    }
  };

  const updateLikeButton = () => {
    const count = currentPost?.likeCount ?? 0;
    const icon = isLiked ? "★" : "☆";
    const label = isLiked ? "추천 취소" : "추천";

    if (elements.likeCountMain) {
      elements.likeCountMain.textContent = count;
    }
    if (elements.likeCountMeta) {
      elements.likeCountMeta.textContent = count;
    }
    if (elements.likeButton) {
      elements.likeButton.dataset.liked = String(isLiked);
      const iconEl = elements.likeButton.querySelector(".tile-icon");
      const titleEl = elements.likeButton.querySelector(".tile-title");
      if (iconEl) iconEl.textContent = icon;
      if (titleEl) titleEl.textContent = label;
    }
  };

  const renderPost = () => {
    if (!currentPost) return;
    const { title, author, createdAt, content, viewCount, likeCount, commentCount } = currentPost;
    if (elements.title) elements.title.textContent = title || "제목 없음";
    if (elements.author) elements.author.textContent = author || "-";
    if (elements.date) elements.date.textContent = formatDateTime(createdAt);
    if (elements.viewCount) elements.viewCount.textContent = Number(viewCount ?? 0).toLocaleString();
    if (elements.likeCountMeta) elements.likeCountMeta.textContent = Number(likeCount ?? 0);
    updateCommentCounts(Number(commentCount ?? currentComments.length ?? 0));
    if (elements.content) {
      elements.content.innerHTML = content || "<p>본문이 비어 있습니다.</p>";
    }
    updateLikeButton();
  };

  const renderComments = () => {
    if (!elements.commentList) return;
    if (!currentComments.length) {
      elements.commentList.innerHTML =
        '<div class="community-empty"><p>등록된 댓글이 아직 없습니다</p></div>';
      return;
    }

    elements.commentList.innerHTML = currentComments
      .map((comment) => {
        const author = comment.author || `회원 #${comment.userId ?? "-"}`;
        const date = formatDateTime(comment.createdAt);
        const canDelete = usingMock ? comment.userId === USER_ID : Boolean(comment.isOwner || comment.userId === USER_ID);
        const body = escapeHtml(comment.content || "").replace(/\n/g, "<br>");
        const deleteButton = canDelete
          ? `<button class="comment-delete" type="button" data-id="${comment.id}">삭제</button>`
          : "";

        return `
          <article class="comment-card" data-comment-id="${comment.id}">
            <header class="comment-meta">
              <span class="comment-author">${escapeHtml(author)}</span>
              <div class="comment-meta-right">
                <span class="comment-date">${date}</span>
                ${deleteButton}
              </div>
            </header>
            <div class="comment-body">${body}</div>
          </article>
        `;
      })
      .join("");

    elements.commentList.querySelectorAll(".comment-delete").forEach((button) => {
      button.addEventListener("click", () => {
        const commentId = button.getAttribute("data-id");
        if (commentId) {
          deleteComment(commentId, button);
        }
      });
    });
  };

  const loadMockData = (fromFallback = false) => {
    const mockPost = pickMockPost(postId);
    if (!mockPost) {
      status.error("샘플 게시글을 찾을 수 없습니다.");
      return;
    }
    usingMock = true;
    currentPost = mockPost;
    currentComments = pickMockComments(mockPost.id);
    status.message(fromFallback ? "게시글을 불러오지 못해 샘플 데이터를 보여줍니다." : "샘플 데이터를 보여주는 중입니다.");
    renderPost();
    renderComments();
  };

  const loadPost = () => {
    if (preferMock) {
      loadMockData(false);
      return Promise.resolve();
    }

    status.loading("게시글을 불러오는 중입니다...");
    return fetch(`${COMMUNITY_POST_BASE}/${encodeURIComponent(postId)}`, {
      headers: { Accept: "application/json" }
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((post) => {
        usingMock = false;
        currentPost = post;
        isLiked = Boolean(post.isLiked);
        renderPost();
        status.clear();
      })
      .catch(() => {
        loadMockData(true);
      });
  };

  const loadComments = () => {
    if (usingMock) {
      currentComments = pickMockComments(currentPost?.id);
      updateCommentCounts(currentComments.length);
      renderComments();
      return;
    }

    if (!currentPost) return;

    commentStatus.loading("댓글을 불러오는 중입니다...");
    fetch(`${COMMUNITY_POST_BASE}/${encodeURIComponent(postId)}/comments`, {
      headers: { Accept: "application/json" }
    })
      .then((res) => {
        if (!res.ok) throw new Error("comments failed");
        return res.json();
      })
      .then((comments) => {
        currentComments = Array.isArray(comments) ? comments : [];
        updateCommentCounts(currentComments.length);
        renderComments();
        commentStatus.clear();
      })
      .catch(() => {
        commentStatus.error("댓글을 불러오지 못했어요.");
        currentComments = [];
        renderComments();
      });
  };

  const submitComment = (e) => {
    e.preventDefault();
    if (!elements.commentInput || !elements.commentSubmit) return;
    const content = (elements.commentInput.value || "").trim();
    if (!content) return;
    elements.commentSubmit.disabled = true;

    if (usingMock) {
      const newComment = {
        id: `mock-${Date.now()}`,
        userId: USER_ID,
        author: currentUserName(),
        content,
        createdAt: new Date().toISOString()
      };
      currentComments.push(newComment);
      elements.commentInput.value = "";
      updateCommentCounts(currentComments.length);
      renderComments();
      commentStatus.message("샘플 댓글이 등록되었습니다.");
      setTimeout(() => commentStatus.clear(), 1200);
      elements.commentSubmit.disabled = false;
      return;
    }

    const body = { postId, userId: USER_ID, content };
    const extraHeaders = (typeof Auth !== 'undefined' && Auth.authHeader) ? Auth.authHeader() : {};
    fetch(`${COMMUNITY_COMMENT_BASE}`, {
      method: "POST",
      headers: Object.assign({ 'Content-Type': 'application/json' }, extraHeaders),
      body: JSON.stringify(body)
    })
      .then((res) => { if (!res.ok) throw new Error('comment failed'); return res.json(); })
      .then((saved) => {
        elements.commentInput.value = "";
        commentStatus.message("댓글이 등록되었습니다.");
        loadComments();
        setTimeout(() => commentStatus.clear(), 1200);
      })
      .catch(() => {
        commentStatus.error("댓글 등록 중 오류가 발생했습니다.");
      })
      .finally(() => {
        elements.commentSubmit.disabled = false;
      });
  };

  const deleteComment = (commentId, buttonEl) => {
    if (!commentId) return;
    if (!confirm("이 댓글을 삭제할까요?")) return;
    buttonEl.disabled = true;

    if (usingMock) {
      currentComments = currentComments.filter((comment) => comment.id !== commentId);
      currentPost.commentCount = Math.max((currentPost.commentCount ?? 1) - 1, 0);
      renderComments();
      updateCommentCounts(currentComments.length);
      commentStatus.message("샘플 댓글이 삭제되었습니다.");
      setTimeout(() => commentStatus.clear(), 1200);
      buttonEl.disabled = false;
      return;
    }

    fetch(`${COMMUNITY_COMMENT_BASE}/${encodeURIComponent(commentId)}?userId=${USER_ID}&admin=false`, {
      method: "DELETE"
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 403) throw new Error('forbidden');
          throw new Error('delete failed');
        }
      })
      .then(() => {
        commentStatus.message("댓글이 삭제되었습니다.");
        loadComments();
        setTimeout(() => commentStatus.clear(), 1200);
      })
      .catch((err) => {
        if (String(err && err.message) === 'forbidden') {
          commentStatus.error("본인 댓글만 삭제할 수 있어요.");
        } else {
          commentStatus.error("댓글 삭제 중 오류가 발생했습니다.");
        }
      })
      .finally(() => {
        buttonEl.disabled = false;
      });
  };

  const toggleLike = () => {
    if (!currentPost) return;
    // Local-only like toggle to avoid API dependency for now
    isLiked = !isLiked;
    currentPost.likeCount = Math.max((currentPost.likeCount ?? 0) + (isLiked ? 1 : -1), 0);
    localStorage.setItem(likeStorageKey, String(isLiked));
    updateLikeButton();
  };

  if (elements.likeButton) {
    elements.likeButton.addEventListener("click", toggleLike);
  }

  if (elements.shareButton) {
    elements.shareButton.addEventListener("click", () => {
      const shareData = {
        title: currentPost?.title || document.title,
        url: window.location.href
      };

      if (navigator.share) {
        navigator.share(shareData).catch(() => {});
        return;
      }

      if (navigator.clipboard?.writeText) {
        navigator.clipboard
          .writeText(shareData.url)
          .then(() => alert("링크가 복사되었습니다."))
          .catch(() => alert("링크 복사에 실패했습니다."));
      } else {
        prompt("링크를 복사해 주세요", shareData.url);
      }
    });
  }

  elements.commentForm?.addEventListener("submit", submitComment);

  loadPost()
    .then(() => loadComments())
    .catch(() => loadComments());
});

function createStatusManager(element, baseClass) {
  const base = baseClass || "";

  const apply = (message, variant) => {
    if (!element) return;
    element.textContent = message;
    const classNames = [base];
    if (variant && message) {
      classNames.push(variant);
    }
    element.className = classNames.filter(Boolean).join(" ");
  };

  return {
    loading(message) {
      apply(message, "loading");
    },
    message(message) {
      apply(message, "");
    },
    error(message) {
      apply(message, "error");
    },
    clear() {
      apply("", "");
    }
  };
}

function formatDateTime(iso) {
  if (!iso) return "";
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}.${mm}.${dd} ${hh}:${mi}`;
  } catch {
    return iso;
  }
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

