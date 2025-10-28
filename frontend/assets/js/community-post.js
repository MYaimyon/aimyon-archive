const COMMUNITY_POST_BASE = "http://localhost:8080/api/community/posts";
const COMMUNITY_COMMENT_BASE = "http://localhost:8080/api/community/comments";
const USER_ID_STORAGE_KEY = "aimyonCommunityUserId";
const LIKE_STORAGE_PREFIX = "aimyonCommunityLike_";

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
    likeCount: document.getElementById("likeCount"),
    selfUserId: document.getElementById("selfUserId"),
    commentForm: document.getElementById("commentForm"),
    commentInput: document.getElementById("commentInput"),
    commentStatus: document.getElementById("commentStatus")
  };

  if (!id) {
    elements.content.innerHTML = "<p>잘못된 접근입니다. 글 ID가 필요합니다.</p>";
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

  const fmtDate = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
        d.getDate()
      ).padStart(2, "0")}`;
    } catch {
      return iso;
    }
  };

  const updateLikeButton = () => {
    const count = currentPost?.likeCount ?? 0;
    if (elements.likeCount) {
      elements.likeCount.textContent = count;
    }
    if (elements.likeLabel) {
      elements.likeLabel.textContent = isLiked ? "❤️ 좋아요 취소" : "🤍 좋아요";
    }
    elements.likeButton.classList.toggle("liked", isLiked);
    elements.likeButton.setAttribute("aria-pressed", String(isLiked));
  };

  const setCommentStatus = (message, type = "info") => {
    if (!elements.commentStatus) return;
    elements.commentStatus.textContent = message || "";
    elements.commentStatus.classList.toggle("error", type === "error");
    elements.commentStatus.classList.toggle("success", type === "success");
  };

  const renderPost = (post) => {
    currentPost = post;
    elements.board.textContent = `#${post.boardSlug ?? ""}`;
    elements.date.textContent = fmtDate(post.createdAt);
    elements.title.textContent = post.title || "제목 없음";
    elements.author.textContent = `작성자 #${post.userId ?? "-"}`;
    elements.content.innerHTML = (post.content || "내용 없음").replace(/\n/g, "<br>");
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
        elements.content.innerHTML = "<p>게시글을 불러오지 못했어요.</p>";
      });

  const renderComments = (items) => {
    if (!items.length) {
      elements.comments.innerHTML =
        '<div class="community-empty" style="margin:0;"><p>아직 댓글이 없어요.</p></div>';
      return;
    }
    elements.comments.innerHTML = items
      .map((comment) => {
        const canDelete = Number(comment.userId) === USER_ID;
        const deleteButton = canDelete
          ? `<button class="comment-delete" data-id="${comment.id}" type="button">삭제</button>`
          : "";
        return `
          <div class="comment-card">
            <div class="comment-meta">
              <span>작성자 #${comment.userId ?? "-"}</span>
              <span>${fmtDate(comment.createdAt)}</span>
              ${deleteButton}
            </div>
            <div class="comment-body">${(comment.content || "").replace(/\n/g, "<br>")}</div>
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
          '<div class="community-empty" style="margin:0;"><p>댓글을 불러오지 못했어요.</p></div>';
      });
  };

  const deleteComment = (commentId, buttonEl) => {
    if (!commentId) return;
    const confirmed = confirm("댓글을 삭제할까요?");
    if (!confirmed) return;
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
        setCommentStatus("등록되었습니다!", "success");
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

  loadPost().then(() => updateLikeButton()).catch(() => {});
  loadComments();
});
