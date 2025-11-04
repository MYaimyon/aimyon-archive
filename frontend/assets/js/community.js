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
const PAGE_SIZE = 15;

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
  const postsBody = document.getElementById("communityPosts");
  const searchInput = document.getElementById("communitySearchInput");
  const paginationEl = document.getElementById("communityPagination");
  const prevPageBtn = document.getElementById("communityPrevPage");
  const nextPageBtn = document.getElementById("communityNextPage");
  const pageInfoEl = document.getElementById("communityPageInfo");

  const userId = getOrCreateUserId();
  const urlParams = new URLSearchParams(window.location.search);
  const requestedBoard = urlParams.get("board");

  let boards = [];
  let activeSlug = null;
  let allPosts = [];
  let filteredPosts = [];
  let currentPage = 1;

  const skeleton = (rowCount = 8) =>
    Array.from({ length: rowCount })
      .map(() => '<tr class="skeleton-row"><td colspan="7"><div class="skeleton-line"></div></td></tr>')
      .join("");

  const updatePagination = (page, totalPages) => {
    if (!paginationEl || !pageInfoEl || !prevPageBtn || !nextPageBtn) return;
    const safeTotal = Math.max(totalPages, 1);
    const safePage = Math.min(Math.max(page, 1), safeTotal);
    pageInfoEl.textContent = `${safePage} / ${safeTotal}`;

    if (safeTotal <= 1) {
      paginationEl.setAttribute("hidden", "");
    } else {
      paginationEl.removeAttribute("hidden");
    }

    prevPageBtn.disabled = safePage <= 1;
    nextPageBtn.disabled = safePage >= safeTotal;
  };

  const renderEmptyState = () => {
    if (!postsBody) return;
    postsBody.innerHTML = '<tr class="community-empty-row"><td colspan="7">등록된 게시글이 없습니다.</td></tr>';
    updatePagination(1, 1);
  };

  const renderRows = (items) => {
    if (!postsBody) return;
    if (!items.length) {
      renderEmptyState();
      return;
    }

    const totalItems = filteredPosts.length;
    const activeBoard = boards.find((board) => board.slug === activeSlug);

    const rows = items
      .map((post, index) => {
        const absoluteIndex = (currentPage - 1) * PAGE_SIZE + index;
        const descendingNumber = totalItems ? totalItems - absoluteIndex : null;
        const displayNumber = post.notice || post.isNotice || (post.type && String(post.type).toUpperCase().includes("NOTICE"))
          ? "공지"
          : descendingNumber && descendingNumber > 0
            ? descendingNumber
            : absoluteIndex + 1;

        const isNotice = String(post.type || "").toUpperCase().includes("NOTICE") || Boolean(post.notice || post.isNotice || post.pinned);
        const categoryRaw = post.category || post.topic || post.badge || (post.tags && post.tags[0]);
        const categoryDisplay = isNotice
          ? "공지"
          : categoryRaw
            ? normalizeText(categoryRaw)
            : activeBoard?.name || "-";

        const titleText = normalizeText(post.title || "제목 없음");
        const commentCount = Number(post.commentCount ?? (Array.isArray(post.comments) ? post.comments.length : 0));
        const commentHtml = commentCount > 0 ? `<span class="comment-count">[${commentCount}]</span>` : "";
        const authorText = normalizeText(
          post.author ||
            post.writer ||
            post.nickname ||
            post.userName ||
            (post.userId ? `사용자 #${post.userId}` : "-")
        );
        const createdAt = formatDate(post.createdAt);
        const viewCount = Number(post.viewCount ?? post.views ?? post.hit ?? 0);
        const recommendCount = Number(post.likeCount ?? post.recommendCount ?? 0);
        const canDelete = Number(post.userId) === userId;
        const deleteButton = canDelete
          ? `<button class="row-delete" data-id="${post.id}" type="button">삭제</button>`
          : "";

        const titleLink = `community-post.html?id=${encodeURIComponent(post.id)}`;

        return `
          <tr class="${isNotice ? "row-notice" : ""}">
            <td class="col-title">
              <div class="title-cell">
                <div class="title-main">
                  <span class="title-badge">${escapeHtml(categoryDisplay)}</span>
                  <a class="title-link" href="${titleLink}">${escapeHtml(titleText)}</a>
                  ${commentHtml}
                </div>
                ${deleteButton}
              </div>
            </td>
            <td class="col-author">${escapeHtml(authorText)}</td>
            <td class="col-date">${createdAt}</td>
            <td class="col-views">${Number.isFinite(viewCount) ? viewCount.toLocaleString("ko-KR") : "-"}</td>
            <td class="col-recommends">${Number.isFinite(recommendCount) ? recommendCount.toLocaleString("ko-KR") : "-"}</td>
          </tr>
        `;
      })
      .join("");

    postsBody.innerHTML = rows;
    postsBody.querySelectorAll(".row-delete").forEach((btn) => {
      btn.addEventListener("click", () => deletePost(btn.dataset.id, btn));
    });
  };

  const renderCurrentPage = () => {
    if (!postsBody) return;
    if (!filteredPosts.length) {
      renderEmptyState();
      return;
    }
    const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }
    const start = (currentPage - 1) * PAGE_SIZE;
    const items = filteredPosts.slice(start, start + PAGE_SIZE);
    renderRows(items);
    updatePagination(currentPage, totalPages);
  };

  const applyFilters = () => {
    const term = (searchInput?.value || "").trim().toLowerCase();
    if (!term) {
      filteredPosts = [...allPosts];
    } else {
      filteredPosts = allPosts.filter((post) => {
        const title = normalizeText(post.title || "").toLowerCase();
        const content = normalizeText(post.content || "").toLowerCase();
        return title.includes(term) || content.includes(term);
      });
    }
    currentPage = 1;
    renderCurrentPage();
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
        if (!slug || slug === activeSlug) return;
        currentPage = 1;
        const params = new URLSearchParams(window.location.search);
        params.set("board", slug);
        window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
        loadPosts(slug);
      });
    });
  };

  const loadPosts = (boardSlug) => {
    activeSlug = boardSlug;
    renderBoards();
    if (!postsBody) return;
    postsBody.innerHTML = skeleton();
    paginationEl?.setAttribute("hidden", "");

    fetch(`${COMMUNITY_API_BASE}/posts?board=${encodeURIComponent(boardSlug)}`)
      .then((res) => res.json())
      .then((data) => {
        allPosts = Array.isArray(data?.content) ? data.content : [];
        applyFilters();
      })
      .catch(() => {
        renderEmptyState();
      });
  };

  const loadBoards = () => {
    if (!boardsEl) return;
    boardsEl.textContent = "게시판 불러오는 중...";
    fetch(`${COMMUNITY_API_BASE}/boards`)
      .then((res) => res.json())
      .then((data) => {
        boards = Array.isArray(data) ? data : [];
        boards.sort((a, b) => {
          if (a.slug === "free") return b.slug === "free" ? 0 : -1;
          if (b.slug === "free") return 1;
          return 0;
        });
        if (!boards.length) {
          boardsEl.innerHTML = '<span class="community-tabs__loading-error">게시판이 없습니다.</span>';
          renderEmptyState();
          return;
        }
        const requestedExists = boards.some((board) => board.slug === requestedBoard);
        const defaultBoard = boards.find((board) => board.slug === "free") || boards[0];
        activeSlug = requestedExists ? requestedBoard : defaultBoard.slug;
        renderBoards();
        loadPosts(activeSlug);
      })
      .catch(() => {
        boardsEl.innerHTML = '<span class="community-tabs__loading-error">게시판을 불러오지 못했어요.</span>';
        renderEmptyState();
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

  searchInput?.addEventListener("input", () => {
    applyFilters();
  });

  prevPageBtn?.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage -= 1;
      renderCurrentPage();
    }
  });

  nextPageBtn?.addEventListener("click", () => {
    const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
    if (currentPage < totalPages) {
      currentPage += 1;
      renderCurrentPage();
    }
  });

  paginationEl?.setAttribute("hidden", "");
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

function normalizeText(text) {
  if (!text) return "";
  const suspiciousPattern = /Ã|Â|Æ|ð|Ê|ì|í|î|ï/;
  if (!suspiciousPattern.test(text)) {
    return text;
  }
  try {
    const decoded = decodeURIComponent(escape(text));
    return decoded;
  } catch {
    return text;
  }
}

function formatDate(iso) {
  if (!iso) return "-";
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch {
    return iso;
  }
}
