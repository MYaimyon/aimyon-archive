const COMMUNITY_POST_BASE = "http://localhost:8080/api/community/posts";
const COMMUNITY_COMMENT_BASE = "http://localhost:8080/api/community/comments";
const USER_ID_STORAGE_KEY = "aimyonCommunityUserId";
const LIKE_STORAGE_PREFIX = "aimyonCommunityLike_";

const BOARD_LABELS = {
  free: "자유게시판",
  pilgrimage: "묭지순례 인증",
  gallery: "팬아트",
  story: "이야기",
  media: "미디어"
};

const getBoardLabel = (slug) => BOARD_LABELS[slug] || slug || "게시판";

const fmtDate = (iso) => {
  if (!iso) return "";
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
      date.getDate()
    ).padStart(2, "0")}`;
  } catch {
    return iso;
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const qs = new URLSearchParams(location.search);
  const id = qs.get("id");

  const elements = {
    board: document.getElementById("cpBoard"),
    date: document.getElementById("cpDate"),
    title: document.getElementById("cpTitle"),
    author: document.getElementById("cpAuthor"),
    content: document.getElementById("cpContent"),
    comments: document.getElementById("commentList"),
    likeButton: document.getElementById("likeButton"),
    likeLabel: document.querySelector("#likeButton .like-label"),
    likeIcon: document.querySelector("#likeButton .like-icon"),
    likeText: document.querySelector("#likeButton .like-text"),
    likeCount: document.getElementById("likeCount"),
    selfUserId: document.getElementById("selfUserId"),
    commentForm: document.getElementById("commentForm"),
    commentInput: document.getElementById("commentInput"),
    commentStatus: document.getElementById("commentStatus")
  };

  if (!id) {
    elements.content.innerHTML = "<p>필요한 게시글 ID가 없습니다.</p>";
    return;
  }

  const getOrCreateUserId = () => {
    const stored = localStorage.getItem(USER_ID_STORAGE_KEY);
    if (stored && !Number.isNaN(Number(stored))) {
      return Number(stored);
    }
    const randomId = Math.floor(Math.random() * 900000) + 100000;
    localStorage.setItem(USER_ID_STORAGE_KEY, String(randomId));
    return randomId;
  };

  const USER_ID = getOrCreateUserId();
  elements.selfUserId.textContent = USER_ID;
  const likeStorageKey = `${LIKE_STORAGE_PREFIX}${id}`;
  let currentPost = null;
  let isLiked = localStorage.getItem(likeStorageKey) === "true";

  const updateLikeButton = () => {
    const count = currentPost?.likeCount ?? 0;
    if (elements.likeCount) {
      elements.likeCount.textContent = count;
    }
    const icon = isLiked ? "♥" : "🤍";
    const labelText = isLiked ? "좋아요 취소" : "좋아요";
    if (elements.likeIcon) {
      elements.likeIcon.textContent = icon;
    }
    if (elements.likeText) {
      elements.likeText.textContent = labelText;
    } else if (elements.likeLabel) {
      elements.likeLabel.textContent = `${icon} ${labelText}`;
    }
    elements.likeButton?.classList.toggle("liked", isLiked);
    elements.likeButton?.setAttribute("aria-pressed", String(isLiked));
  };

  const setCommentStatus = (message, type = "info") => {
    if (!elements.commentStatus) return;
    elements.commentStatus.textContent = message || "";
    elements.commentStatus.classList.toggle("error", type === "error");
    elements.commentStatus.classList.toggle("success", type === "success");
  };

  const renderPost = (post) => {
    currentPost = post;
    const boardLabel = getBoardLabel(post.boardSlug);
    elements.board.textContent = boardLabel ? `#${boardLabel}` : "#게시판";
    elements.date.textContent = fmtDate(post.createdAt);
    elements.title.textContent = post.title || "제목 없음";
    const authorName = post.authorName || post.author || post.writer || post.nickname;
    const authorValue =
      authorName || (post.userId !== undefined && post.userId !== null ? `#${post.userId}` : "-");
    elements.author.textContent = authorValue;
    const body = post.content ? post.content.replace(/\n/g, "<br>") : "내용이 없습니다.";
    elements.content.innerHTML = body;
    updateLikeButton();
  };

  const loadPost = () =>
    fetch(`${COMMUNITY_POST_BASE}/${encodeURIComponent(id)}`)
      .then((res) => {
        if (!res.ok) throw new Error("post fetch failed");
        return res.json();
      })
      .then(renderPost)
      .catch(() => {
        elements.content.innerHTML = "<p>게시글을 불러오지 못했습니다.</p>";
      });

  const renderComments = (items) => {
    if (!items.length) {
      elements.comments.innerHTML =
        '<div class="community-empty" style="margin:0;"><p>아직 댓글이 없습니다.</p></div>';
      return;
    }

    elements.comments.innerHTML = items
      .map((comment) => {
        const canDelete = Number(comment.userId) === USER_ID;
        const deleteButton = canDelete
          ? `<button class="comment-delete" data-id="${comment.id}" type="button">삭제</button>`
          : "";
        const content = (comment.content || "").replace(/\n/g, "<br>");
        return `
          <div class="comment-card">
            <div class="comment-meta">
              <span>작성자 #${comment.userId ?? "-"}</span>
              <span>${fmtDate(comment.createdAt)}</span>
              ${deleteButton}
            </div>
            <div class="comment-body">${content}</div>
          </div>
        `;
      })
      .join("");

    elements.comments
      .querySelectorAll(".comment-delete")
      .forEach((btn) =>
        btn.addEventListener("click", () => deleteComment(btn.getAttribute("data-id"), btn))
      );
  };

  const loadComments = () => {
    elements.comments.innerHTML = '<p style="opacity:.7">댓글을 불러오는 중...</p>';
    fetch(`${COMMUNITY_POST_BASE}/${encodeURIComponent(id)}/comments`)
      .then((res) => {
        if (!res.ok) throw new Error("comments fetch failed");
        return res.json();
      })
      .then(renderComments)
      .catch(() => {
        elements.comments.innerHTML =
          '<div class="community-empty" style="margin:0;"><p>댓글을 불러오지 못했습니다.</p></div>';
      });
  };

  const deleteComment = (commentId, buttonEl) => {
    if (!commentId) return;
    if (!confirm("댓글을 삭제할까요?")) return;

    buttonEl.disabled = true;
    fetch(`${COMMUNITY_COMMENT_BASE}/${encodeURIComponent(commentId)}?userId=${USER_ID}&admin=false`, {
      method: "DELETE"
    })
      .then((res) => {
        if (!res.ok) throw new Error("delete failed");
      })
      .then(() => {
        setCommentStatus("삭제가 완료되었습니다.", "success");
        loadComments();
        loadPost();
        setTimeout(() => setCommentStatus(""), 1200);
      })
      .catch(() => {
        setCommentStatus("댓글 삭제에 실패했습니다.", "error");
      })
      .finally(() => {
        buttonEl.disabled = false;
      });
  };

  const toggleLike = () => {
    if (!elements.likeButton) return;
    elements.likeButton.disabled = true;
    const method = isLiked ? "DELETE" : "POST";
    fetch(`${COMMUNITY_POST_BASE}/${encodeURIComponent(id)}/like?userId=${USER_ID}`, { method })
      .then((res) => {
        if (!res.ok) throw new Error("like failed");
        return res.json();
      })
      .then((post) => {
        renderPost(post);
        isLiked = !isLiked;
        localStorage.setItem(likeStorageKey, String(isLiked));
        updateLikeButton();
      })
      .catch(() => {
        alert("좋아요 처리에 실패했습니다.");
      })
      .finally(() => {
        elements.likeButton.disabled = false;
      });
  };

  const submitComment = (event) => {
    event.preventDefault();
    const content = elements.commentInput.value.trim();
    if (!content) {
      setCommentStatus("댓글 내용을 입력해 주세요.", "error");
      return;
    }

    setCommentStatus("댓글을 등록하는 중입니다...");
    elements.commentForm.querySelector("button").disabled = true;

    fetch(`${COMMUNITY_POST_BASE}/${encodeURIComponent(id)}/comments`, {
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
        setCommentStatus("댓글이 등록되었습니다.", "success");
        loadComments();
        loadPost();
        setTimeout(() => setCommentStatus(""), 1500);
      })
      .catch(() => {
        setCommentStatus("댓글 등록에 실패했습니다.", "error");
      })
      .finally(() => {
        elements.commentForm.querySelector("button").disabled = false;
      });
  };

  elements.likeButton?.addEventListener("click", toggleLike);
  elements.commentForm?.addEventListener("submit", submitComment);

  loadPost().then(updateLikeButton).catch(() => {});
  loadComments();
});
