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

const USER_ID_KEY = "aimyonCommunityUserId";

const getOrCreateUserId = () => {
  const stored = localStorage.getItem(USER_ID_KEY);
  if (stored && !Number.isNaN(Number(stored))) {
    return Number(stored);
  }
  const randomId = Math.floor(Math.random() * 900000) + 100000;
  localStorage.setItem(USER_ID_KEY, String(randomId));
  return randomId;
};

document.addEventListener("DOMContentLoaded", () => {
  const boardsEl = document.getElementById("communityBoards");
  const postsEl = document.getElementById("communityPosts");
  const formEl = document.getElementById("communityPostForm");
  const statusEl = document.getElementById("communityPostStatus");
  const titleEl = document.getElementById("postTitle");
  const contentEl = document.getElementById("postContent");
  const userIdTextEl = document.getElementById("communityUserId");

  const userId = getOrCreateUserId();
  if (userIdTextEl) {
    userIdTextEl.textContent = userId;
  }

  let boards = [];
  let activeSlug = null;

  const skeleton = (count = 3) =>
    Array.from({ length: count })
      .map(
        () => `
        <div class="community-card skeleton">
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
      `
      )
      .join("");

  const setFormStatus = (message, type = "info") => {
    if (!statusEl) return;
    statusEl.textContent = message || "";
    statusEl.className = "form-status";
    if (type === "success") statusEl.classList.add("success");
    if (type === "error") statusEl.classList.add("error");
  };

  const renderBoards = () => {
    if (!boardsEl) return;
    boardsEl.innerHTML = boards
      .map(
        (board) => `
        <button
          class="community-tab ${board.slug === activeSlug ? "active" : ""}"
          data-slug="${board.slug}"
          role="tab"
          aria-selected="${board.slug === activeSlug}"
        >
          ${board.name}
        </button>
      `
      )
      .join("");

    boardsEl.querySelectorAll(".community-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        const slug = btn.dataset.slug;
        if (slug !== activeSlug) {
          loadPosts(slug);
        }
      });
    });
  };

  const renderPosts = (items) => {
    if (!postsEl) return;
    if (!items.length) {
      postsEl.innerHTML = `
        <div class="community-empty">
          <div class="emoji" style="font-size: 2.5rem; margin-bottom: 12px;">📭</div>
          <p>아직 등록된 글이 없어요.</p>
        </div>
      `;
      return;
    }

    postsEl.innerHTML = items
      .map((post) => {
        const snippet = (post.content || "").length > 140
          ? `${post.content.slice(0, 140)}…`
          : post.content || "내용 없음";
        const canDelete = Number(post.userId) === userId;
        return `
          <div class="community-card">
            <h3>${escapeHtml(post.title || "제목 없음")}</h3>
            <p>${escapeHtml(snippet).replace(/\n/g, "<br>")}</p>
            <div class="meta">
              <span>작성자 #${post.userId ?? "-"}</span>
              <span>좋아요 ${post.likeCount ?? 0}</span>
              <span>댓글 ${post.commentCount ?? 0}</span>
              <span>${formatDate(post.createdAt)}</span>
            </div>
            <div class="card-actions">
              <a class="card-link" href="community-post.html?id=${encodeURIComponent(post.id)}">상세보기</a>
              ${canDelete ? `<button class="card-delete" data-id="${post.id}" type="button">삭제</button>` : ""}
            </div>
          </div>
        `;
      })
      .join("");

    postsEl.querySelectorAll(".card-delete").forEach((btn) => {
      btn.addEventListener("click", () => deletePost(btn.dataset.id, btn));
    });
  };

  const formatDate = (iso) => {
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

  const loadPosts = (boardSlug) => {
    activeSlug = boardSlug;
    renderBoards();
    if (!postsEl) return;
    postsEl.innerHTML = skeleton();

    fetch(`${COMMUNITY_API_BASE}/posts?board=${encodeURIComponent(boardSlug)}`)
      .then((res) => res.json())
      .then((data) => {
        renderPosts(data.content || []);
      })
      .catch(() => {
        postsEl.innerHTML =
          '<div class="community-empty"><p>게시글을 불러오지 못했어요.</p></div>';
      });
  };

  const loadBoards = () => {
    if (!boardsEl) return;
    boardsEl.innerHTML = skeleton(2);
    fetch(`${COMMUNITY_API_BASE}/boards`)
      .then((res) => res.json())
      .then((data) => {
        boards = Array.isArray(data) ? data : [];
        activeSlug = boards[0]?.slug || null;
        renderBoards();
        if (activeSlug) {
          loadPosts(activeSlug);
        } else if (postsEl) {
          postsEl.innerHTML =
            '<div class="community-empty"><p>생성된 게시판이 없어요.</p></div>';
        }
      })
      .catch(() => {
        boardsEl.innerHTML =
          '<div class="community-empty" style="width:100%;"><p>게시판 목록을 불러오지 못했어요.</p></div>';
      });
  };

  const deletePost = (postId, buttonEl) => {
    if (!postId) return;
    const confirmed = confirm("이 게시글을 삭제할까요?");
    if (!confirmed) return;
    buttonEl.disabled = true;
    fetch(`${COMMUNITY_API_BASE}/posts/${encodeURIComponent(postId)}?userId=${userId}&admin=false`, {
      method: "DELETE"
    })
      .then((res) => {
        if (!res.ok) throw new Error("delete failed");
        loadPosts(activeSlug);
      })
      .catch(() => {
        alert("게시글 삭제에 실패했습니다.");
      })
      .finally(() => {
        buttonEl.disabled = false;
      });
  };

  formEl?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!activeSlug) {
      setFormStatus("먼저 게시판을 선택해 주세요.", "error");
      return;
    }
    const title = titleEl.value.trim();
    const content = contentEl.value.trim();
    if (!title || !content) {
      setFormStatus("제목과 내용을 입력해 주세요.", "error");
      return;
    }

    setFormStatus("등록 중입니다...");
    formEl.querySelector("button").disabled = true;

    fetch(`${COMMUNITY_API_BASE}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        boardSlug: activeSlug,
        title,
        content
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error("create failed");
        return res.json();
      })
      .then(() => {
        titleEl.value = "";
        contentEl.value = "";
        setFormStatus("등록되었습니다!", "success");
        loadPosts(activeSlug);
      })
      .catch(() => {
        setFormStatus("글 등록에 실패했습니다.", "error");
      })
      .finally(() => {
        formEl.querySelector("button").disabled = false;
      });
  });

  loadBoards();
});

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
