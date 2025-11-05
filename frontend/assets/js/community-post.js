const COMMUNITY_POST_BASE = "http://localhost:8080/api/community/posts";
const COMMUNITY_COMMENT_BASE = "http://localhost:8080/api/community/comments";
const USER_ID_STORAGE_KEY = "aimyonCommunityUserId";
const LIKE_STORAGE_PREFIX = "aimyonCommunityLike_";

const TEXT = {
  missingId: "\uD544\uC694\uD55C \uAC8C\uC2DC\uAE00 ID\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
  titleFallback: "\uC81C\uBAA9 \uC5C6\uC74C",
  bodyFallback: "\uBCF8\uBB38\uC774 \uBE44\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.",
  postLoadFail: "\uAC8C\uC2DC\uAE00\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  commentEmpty: "\uCCAB \uB313\uAE00\uC744 \uB0A8\uACA8 \uC8FC\uC138\uC694.",
  commentLoading: "\uB313\uAE00\uC744 \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4...",
  commentLoadFail: "\uB313\uAE00\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  commentConfirmDelete: "\uB313\uAE00\uC744 \uC0AD\uC81C\uD560\uAE4C\uC694?",
  commentDeleted: "\uB313\uAE00\uC774 \uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
  commentDeleteFail: "\uB313\uAE00 \uC0AD\uC81C \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.",
  likeFail: "\uCD94\uCC9C \uCC98\uB9AC \uC911 \uBB38\uC81C\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.",
  commentNeedContent: "\uB313\uAE00 \uB0B4\uC6A9\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
  commentSubmitting: "\uB313\uAE00\uC744 \uB4F1\uB85D\uD558\uB294 \uC911\uC785\uB2C8\uB2E4...",
  commentSubmitted: "\uB313\uAE00\uC774 \uB4F1\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
  commentSubmitFail: "\uB313\uAE00 \uB4F1\uB85D\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.",
  linkCopied: "\uB9C1\uD06C\uAC00 \uBCF5\uC0AC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
  linkCopyFail: "\uB9C1\uD06C \uBCF5\uC0AC\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. \uC8FC\uC18C\uCC3D\uACFC \uD568\uAED8 \uACF5\uC720\uD574 \uC8FC\uC138\uC694.",
  linkCopyPrompt: "\uB9C1\uD06C\uB97C \uBCF5\uC0AC\uD574 \uC8FC\uC138\uC694:"
};

const LABEL = {
  like: "\uCD94\uCC9C",
  likeDone: "\uCD94\uCC9C \uC644\uB8CC",
  share: "\uACF5\uC720"
};

const formatDateTime = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd} ${hh}:${mi}`;
};

document.addEventListener("DOMContentLoaded", () => {
  const qs = new URLSearchParams(location.search);
  const id = qs.get("id");

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
    commentStatus: document.getElementById("commentStatus"),
    commentSubmit: document.querySelector("#commentForm [type=\"submit\"]"),
    commentWriterLabel: document.getElementById("commentWriterLabel")
  };

  if (!id) {
    elements.content.innerHTML = `<p>${TEXT.missingId}</p>`;
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

  const likeStorageKey = `${LIKE_STORAGE_PREFIX}${id}`;
  let currentPost = null;
  let isLiked = localStorage.getItem(likeStorageKey) === "true";

  const updateCommentCounts = (count) => {
    const value = Number.isFinite(count) ? count : 0;
    if (elements.commentCountMeta) {
      elements.commentCountMeta.textContent = value;
    }
    if (elements.commentTotalLabel) {
      elements.commentTotalLabel.innerHTML = `\uC804\uCCB4 \uB313\uAE00 <strong>${value}</strong>\uAC1C`;
    }
  };

  const updateLikeButton = () => {
    const count = currentPost?.likeCount ?? 0;
    const icon = isLiked ? "\u2605" : "\u2606";
    const label = isLiked ? LABEL.likeDone : LABEL.like;

    if (elements.likeCountMain) {
      elements.likeCountMain.textContent = count;
    }
    if (elements.likeCountMeta) {
      elements.likeCountMeta.textContent = count;
    }
    if (elements.likeButton) {
      elements.likeButton.classList.toggle("liked", isLiked);
      elements.likeButton.setAttribute("aria-pressed", String(isLiked));
      const iconTarget = elements.likeButton.querySelector(".tile-icon");
      const labelTarget = elements.likeButton.querySelector(".tile-title");
      if (iconTarget) iconTarget.textContent = icon;
      if (labelTarget) labelTarget.textContent = label;
    }
  };

  const setCommentStatus = (message, type = "info") => {
    if (!elements.commentStatus) return;
    elements.commentStatus.textContent = message || "";
    elements.commentStatus.classList.toggle("error", type === "error");
    elements.commentStatus.classList.toggle("success", type === "success");
  };

  const renderPost = (post) => {
    currentPost = post;
    elements.title.textContent = post.title || TEXT.titleFallback;

    const authorName = post.authorName || post.author || post.writer || post.nickname;
    if (authorName) {
      elements.author.textContent = authorName;
    } else if (post.userId !== undefined && post.userId !== null) {
      elements.author.textContent = `#${post.userId}`;
    } else {
      elements.author.textContent = "-";
    }

    elements.date.textContent = formatDateTime(post.createdAt);

    const viewCount = post.viewCount ?? post.views ?? post.hit ?? 0;
    if (elements.viewCount) {
      elements.viewCount.textContent = viewCount;
    }

    const body = post.content ? post.content.replace(/\n/g, "<br>") : `<p>${TEXT.bodyFallback}</p>`;
    elements.content.innerHTML = body;

    const derivedCommentCount =
      post.commentCount ??
      (Array.isArray(post.comments) ? post.comments.length : post.commentTotal);
    updateCommentCounts(derivedCommentCount ?? 0);

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
        elements.content.innerHTML = `<p>${TEXT.postLoadFail}</p>`;
      });

  const renderComments = (items) => {
    const list = Array.isArray(items) ? items : [];
    updateCommentCounts(list.length);

    if (!list.length) {
      elements.commentList.innerHTML = `<div class="community-empty" style="margin:0;"><p>${TEXT.commentEmpty}</p></div>`;
      return;
    }

    elements.commentList.innerHTML = list
      .map((comment) => {
        const canDelete = Number(comment.userId) === USER_ID;
        const deleteButton = canDelete
          ? `<button class="comment-delete" data-id="${comment.id}" type="button">\uC0AD\uC81C</button>`
          : "";
        const content = (comment.content || "").replace(/\n/g, "<br>");
        const created = formatDateTime(comment.createdAt);
        const author = comment.nickname || comment.author || `#${comment.userId ?? "-"}`;
        return `
          <div class="comment-card">
            <div class="comment-meta">
              <span>${author}</span>
              <span>${created}</span>
              ${deleteButton}
            </div>
            <div class="comment-body">${content}</div>
          </div>
        `;
      })
      .join("");

    elements.commentList
      .querySelectorAll(".comment-delete")
      .forEach((btn) =>
        btn.addEventListener("click", () => deleteComment(btn.getAttribute("data-id"), btn))
      );
  };

  const loadComments = () => {
    elements.commentList.innerHTML = `<p style="opacity:.7">${TEXT.commentLoading}</p>`;
    fetch(`${COMMUNITY_POST_BASE}/${encodeURIComponent(id)}/comments`)
      .then((res) => {
        if (!res.ok) throw new Error("comments fetch failed");
        return res.json();
      })
      .then(renderComments)
      .catch(() => {
        updateCommentCounts(0);
        elements.commentList.innerHTML =
          `<div class="community-empty" style="margin:0;"><p>${TEXT.commentLoadFail}</p></div>`;
      });
  };

  const deleteComment = (commentId, buttonEl) => {
    if (!commentId) return;
    if (!confirm(TEXT.commentConfirmDelete)) return;

    buttonEl.disabled = true;
    fetch(`${COMMUNITY_COMMENT_BASE}/${encodeURIComponent(commentId)}?userId=${USER_ID}&admin=false`, {
      method: "DELETE"
    })
      .then((res) => {
        if (!res.ok) throw new Error("delete failed");
      })
      .then(() => {
        setCommentStatus(TEXT.commentDeleted, "success");
        loadComments();
        loadPost();
        setTimeout(() => setCommentStatus(""), 1200);
      })
      .catch(() => {
        setCommentStatus(TEXT.commentDeleteFail, "error");
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
        currentPost = post;
        isLiked = !isLiked;
        localStorage.setItem(likeStorageKey, String(isLiked));
        updateLikeButton();
      })
      .catch(() => {
        alert(TEXT.likeFail);
      })
      .finally(() => {
        elements.likeButton.disabled = false;
      });
  };

  const submitComment = (event) => {
    event.preventDefault();
    const content = elements.commentInput.value.trim();
    if (!content) {
      setCommentStatus(TEXT.commentNeedContent, "error");
      return;
    }

    setCommentStatus(TEXT.commentSubmitting);
    const submitButton =
      elements.commentSubmit || elements.commentForm?.querySelector('[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
    }

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
        setCommentStatus(TEXT.commentSubmitted, "success");
        loadComments();
        loadPost();
        setTimeout(() => setCommentStatus(""), 1500);
      })
      .catch(() => {
        setCommentStatus(TEXT.commentSubmitFail, "error");
      })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  };

  elements.likeButton?.addEventListener("click", toggleLike);
  elements.shareButton?.addEventListener("click", () => {
    const shareData = {
      title: currentPost?.title || document.title,
      url: location.href
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
      return;
    }

    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(shareData.url)
        .then(() => alert(TEXT.linkCopied))
        .catch(() => alert(TEXT.linkCopyFail));
    } else {
      prompt(TEXT.linkCopyPrompt, shareData.url);
    }
  });
  elements.commentForm?.addEventListener("submit", submitComment);

  loadPost().catch(() => {});
  loadComments();
});
