const COMMUNITY_POST_BASE = "http://localhost:8080/api/community/posts";
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
    elements.content.innerHTML = "<p>Post id is required.</p>";
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
    elements.likeCount.textContent = count;
    if (elements.likeLabel) {
      elements.likeLabel.textContent = isLiked ? "❤️ Unlike" : "🤍 Like";
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
    elements.title.textContent = post.title || "Untitled";
    elements.author.textContent = `User #${post.userId ?? "-"}`;
    elements.content.innerHTML = (post.content || "No content yet.").replace(/\n/g, "<br>");
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
        elements.content.innerHTML = "<p>Failed to load the post.</p>";
      });

  const renderComments = (items) => {
    if (!items.length) {
      elements.comments.innerHTML =
        '<div class="community-empty" style="margin:0;"><p>No comments yet.</p></div>';
      return;
    }
    elements.comments.innerHTML = items
      .map(
        (comment) => `
          <div class="comment-card">
            <div class="comment-meta">
              <span>User #${comment.userId ?? "-"}</span>
              <span>${fmtDate(comment.createdAt)}</span>
            </div>
            <div class="comment-body">${(comment.content || "").replace(/\n/g, "<br>")}</div>
          </div>
        `
      )
      .join("");
  };

  const loadComments = () => {
    elements.comments.innerHTML = '<p style="opacity:.7">Loading comments...</p>';
    fetch(`${COMMUNITY_POST_BASE}/${encodeURIComponent(id)}/comments`)
      .then((res) => {
        if (!res.ok) throw new Error("comments fetch failed");
        return res.json();
      })
      .then(renderComments)
      .catch(() => {
        elements.comments.innerHTML =
          '<div class="community-empty" style="margin:0;"><p>Failed to load comments.</p></div>';
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
        alert("Failed to update like.");
      })
      .finally(() => {
        elements.likeButton.disabled = false;
      });
  };

  const submitComment = (event) => {
    event.preventDefault();
    const content = elements.commentInput.value.trim();
    if (!content) {
      setCommentStatus("Please enter a comment.", "error");
      return;
    }

    setCommentStatus("Submitting comment...");
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
        setCommentStatus("Comment added!", "success");
        loadComments();
        loadPost();
        setTimeout(() => setCommentStatus(""), 1500);
      })
      .catch(() => {
        setCommentStatus("Failed to add comment.", "error");
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
