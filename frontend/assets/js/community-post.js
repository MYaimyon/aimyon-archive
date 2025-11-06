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
    title: "처음 Aimyon을 알게 된 순간",
    author: "미도리",
    authorId: 102938,
    createdAt: "2024-10-20T10:15:00+09:00",
    updatedAt: "2024-10-20T11:00:00+09:00",
    viewCount: 128,
    likeCount: 12,
    commentCount: 4,
    content:
      "<p>중학생 때 우연히 들었던 <em>Marigold</em>가 너무 좋아서 그날부터 Aimyon을 찾아 들었어요. 최근 투어에서는 세트리스트도 훨씬 풍성해져서 감동!</p><p>여러분은 어떤 곡에서 Aimyon을 좋아하게 되었나요?</p>",
    tags: ["잡담"],
    isNotice: false
  },
  "mock-post-1002": {
    id: "mock-post-1002",
    board: "free",
    title: "오사카 공연 다녀온 인증샷 공유",
    author: "라이브덕후",
    authorId: 220011,
    createdAt: "2024-10-18T21:42:00+09:00",
    updatedAt: "2024-10-18T21:42:00+09:00",
    viewCount: 204,
    likeCount: 25,
    commentCount: 9,
    content:
      "<p>10/18 오사카 공연 다녀왔어요! 세트리스트 정리와 사진 몇 장 공유합니다.</p><ul><li>Marigold</li><li>I Love You</li><li>아이네 클라이네</li></ul><p>현장 분위기가 최고였습니다 :)</p>",
    tags: ["후기"],
    isNotice: false
  },
  "mock-post-2101": {
    id: "mock-post-2101",
    board: "pilgrimage",
    title: "시즈오카 Aimyon 벽화 인증",
    author: "묭맘",
    authorId: 302244,
    createdAt: "2024-10-16T14:40:00+09:00",
    updatedAt: "2024-10-16T14:40:00+09:00",
    viewCount: 171,
    likeCount: 22,
    commentCount: 5,
    content:
      "<p>시즈오카 역 근처 Aimyon 벽화 다녀왔어요! 위치는 북쪽 출구에서 도보 5분.</p><p>사진 찍으실 분들은 평일 오전 추천드려요.</p>",
    tags: ["인증샷"],
    isNotice: false
  }
};

const MOCK_COMMENTS = {
  "mock-post-1001": [
    {
      id: "c-1001-1",
      userId: 881122,
      author: "노래부르는고양이",
      content: "저는 愛を伝えたいだとか 듣고 빠졌어요!",
      createdAt: "2024-10-20T11:12:00+09:00"
    },
    {
      id: "c-1001-2",
      userId: 990001,
      author: "도쿄시민",
      content: "최근 투어 셋리스트 공유해주셔서 감사해요 :)",
      createdAt: "2024-10-20T11:45:00+09:00"
    }
  ],
  "mock-post-1002": [
    {
      id: "c-1002-1",
      userId: 441122,
      author: "LIVE기록러",
      content: "Marigold 오프닝 너무 좋았죠!",
      createdAt: "2024-10-19T08:20:00+09:00"
    }
  ],
  "mock-post-2101": [
    {
      id: "c-2101-1",
      userId: 100777,
      author: "순례자",
      content: "지도 공유 감사합니다. 주차 공간도 있나요?",
      createdAt: "2024-10-16T16:20:00+09:00"
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
    status.error("필요한 게시글 ID가 없습니다.");
    if (elements.content) {
      elements.content.innerHTML = "<p>게시글을 찾을 수 없습니다.</p>";
    }
    return;
  }

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
  if (elements.commentWriterLabel) {
    elements.commentWriterLabel.textContent = `#${USER_ID}`;
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
    const label = isLiked ? "추천 완료" : "추천";

    if (elements.likeCountMain) {
      elements.likeCountMain.textContent = count;
    }
    if (elements.likeCountMeta) {
      elements.likeCountMeta.textContent = count;
    }
    if (elements.likeButton) {
      elements.likeButton.dataset.liked = String(isLiked);
      elements.likeButton.querySelector(".tile-icon").textContent = icon;
      elements.likeButton.querySelector(".tile-title").textContent = label;
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
        '<div class="community-empty"><p>등록된 댓글이 아직 없어요.</p></div>';
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
        commentStatus.error("댓글을 불러오지 못했습니다.");
        currentComments = [];
        updateCommentCounts(0);
        elements.commentList.innerHTML =
          '<div class="community-empty"><p>댓글을 불러오지 못했습니다.</p></div>';
      });
  };

  const toggleLike = () => {
    if (!elements.likeButton || !currentPost) return;
    elements.likeButton.disabled = true;

    if (usingMock) {
      isLiked = !isLiked;
      currentPost.likeCount = (currentPost.likeCount ?? 0) + (isLiked ? 1 : -1);
      if (currentPost.likeCount < 0) currentPost.likeCount = 0;
      localStorage.setItem(likeStorageKey, String(isLiked));
      updateLikeButton();
      elements.likeButton.disabled = false;
      return;
    }

    const method = isLiked ? "DELETE" : "POST";
    fetch(`${COMMUNITY_POST_BASE}/${encodeURIComponent(postId)}/like?userId=${USER_ID}`, {
      method
    })
      .then((res) => {
        if (!res.ok) throw new Error("like failed");
        return res.json();
      })
      .then((post) => {
        currentPost = post;
        isLiked = !isLiked;
        localStorage.setItem(likeStorageKey, String(isLiked));
        updateLikeButton();
      })
      .catch(() => {
        alert("추천 처리 중 문제가 발생했습니다.");
      })
      .finally(() => {
        elements.likeButton.disabled = false;
      });
  };

  const submitComment = (event) => {
    event.preventDefault();
    const content = elements.commentInput?.value.trim();
    if (!content) {
      commentStatus.error("댓글 내용을 입력해 주세요.");
      return;
    }

    const submitButton = elements.commentSubmit;
    if (submitButton) submitButton.disabled = true;
    commentStatus.loading("댓글을 등록하는 중입니다...");

    if (usingMock) {
      const newComment = {
        id: `mock-${Date.now()}`,
        userId: USER_ID,
        author: `#${USER_ID}`,
        content,
        createdAt: new Date().toISOString(),
        isOwner: true
      };
      currentComments.unshift(newComment);
      currentPost.commentCount = (currentPost.commentCount ?? 0) + 1;
      elements.commentInput.value = "";
      commentStatus.message("샘플 댓글이 등록되었습니다.");
      renderComments();
      updateCommentCounts(currentComments.length);
      setTimeout(() => commentStatus.clear(), 1500);
      if (submitButton) submitButton.disabled = false;
      return;
    }

    fetch(`${COMMUNITY_POST_BASE}/${encodeURIComponent(postId)}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: USER_ID, content })
    })
      .then((res) => {
        if (!res.ok) throw new Error("comment failed");
        return res.json();
      })
      .then(() => {
        elements.commentInput.value = "";
        commentStatus.message("댓글이 등록되었습니다.");
        loadComments();
        setTimeout(() => commentStatus.clear(), 1500);
      })
      .catch(() => {
        commentStatus.error("댓글 등록에 실패했습니다.");
      })
      .finally(() => {
        if (submitButton) submitButton.disabled = false;
      });
  };

  const deleteComment = (commentId, buttonEl) => {
    if (!commentId) return;
    if (!confirm("댓글을 삭제할까요?")) return;
    buttonEl.disabled = true;

    if (usingMock) {
      currentComments = currentComments.filter((comment) => comment.id !== commentId);
      currentPost.commentCount = Math.max((currentPost.commentCount ?? 1) - 1, 0);
      renderComments();
      updateCommentCounts(currentComments.length);
      commentStatus.message("샘플 댓글을 삭제했습니다.");
      setTimeout(() => commentStatus.clear(), 1200);
      buttonEl.disabled = false;
      return;
    }

    fetch(`${COMMUNITY_COMMENT_BASE}/${encodeURIComponent(commentId)}?userId=${USER_ID}&admin=false`, {
      method: "DELETE"
    })
      .then((res) => {
        if (!res.ok) throw new Error("delete failed");
      })
      .then(() => {
        commentStatus.message("댓글이 삭제되었습니다.");
        loadComments();
        setTimeout(() => commentStatus.clear(), 1200);
      })
      .catch(() => {
        commentStatus.error("댓글 삭제 중 오류가 발생했습니다.");
      })
      .finally(() => {
        buttonEl.disabled = false;
      });
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
        prompt("링크를 복사해 주세요:", shareData.url);
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
