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

const MOCK_COMMUNITY = {
  boards: [
    { slug: "free", name: "자유게시판" },
    { slug: "pilgrimage", name: "성지순례 인증" }
  ],
  posts: {
    free: [
      {
        id: "mock-post-1001",
        title: "처음 Aimyon에 빠진 순간",
        category: "수다",
        author: "미도리",
        createdAt: "2024-10-20T10:15:00+09:00",
        viewCount: 128,
        likeCount: 12,
        commentCount: 4
      },
      {
        id: "mock-post-1002",
        title: "역대 공연 인증샷 공유",
        category: "후기",
        author: "라이브덕",
        createdAt: "2024-10-18T21:42:00+09:00",
        viewCount: 204,
        likeCount: 25,
        commentCount: 9
      },
      {
        id: "mock-post-1003",
        title: "베스트 트랙 TOP5 함께 뽑아보자!",
        category: "투표",
        author: "밍밍",
        createdAt: "2024-10-15T13:00:00+09:00",
        viewCount: 96,
        likeCount: 8,
        commentCount: 6,
        notice: true
      }
    ],
    pilgrimage: [
      {
        id: "mock-post-2101",
        title: "시즈오카 Aimyon 벽화 인증",
        category: "인증",
        author: "하루",
        createdAt: "2024-10-16T14:40:00+09:00",
        viewCount: 171,
        likeCount: 22,
        commentCount: 5
      },
      {
        id: "mock-post-2102",
        title: "하마마츠 카페 방문 아이템",
        category: "후기",
        author: "코코",
        createdAt: "2024-10-11T09:20:00+09:00",
        viewCount: 142,
        likeCount: 17,
        commentCount: 3
      },
      {
        id: "mock-post-2103",
        title: "후쿠오카 버스 루트 정보 공유",
        category: "정보",
        author: "유이",
        createdAt: "2024-10-05T18:00:00+09:00",
        viewCount: 210,
        likeCount: 32,
        commentCount: 11,
        notice: true
      }
    ]
  }
};

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
  const statusEl = document.getElementById("communityStatus");

  const userIdLocal = getOrCreateUserId();
  const getAuthUser = () => (typeof Auth !== 'undefined' && typeof Auth.user === 'function') ? Auth.user() : null;
  const loadAuthLocal = () => { try { const raw = localStorage.getItem('aimyonAuth'); return raw ? JSON.parse(raw) : null; } catch { return null; } };
  const currentUserId = () => {
    const au = getAuthUser();
    if (au?.id) return Number(au.id);
    const local = loadAuthLocal();
    if (local?.user?.id) return Number(local.user.id);
    return Number(userIdLocal);
  };
  const urlParams = new URLSearchParams(window.location.search);
  const requestedBoard = urlParams.get("board");
  const preferMock = urlParams.get("mock") === "1";
  const status = createStatusManager(statusEl, "community-status");

  let boards = [];
  let activeSlug = null;
  let allPosts = [];
  let filteredPosts = [];
  let currentPage = 1;

  const skeleton = (rowCount = 8) =>
    Array.from({ length: rowCount })
      .map(() => '<tr class="skeleton-row"><td colspan="5"><div class="skeleton-line"></div></td></tr>')
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

  const renderBoards = () => {
    if (!boardsEl) return;
    boardsEl.innerHTML = boards
      .map((board) => {
        const isActive = board.slug === activeSlug;
        return `<button class="community-tab${isActive ? " active" : ""}" data-slug="${board.slug}" role="tab">${escapeHtml(board.name)}</button>`;
      })
      .join("");

    boardsEl.querySelectorAll(".community-tab").forEach((button) => {
      button.addEventListener("click", () => {
        const slug = button.getAttribute("data-slug");
        if (slug && slug !== activeSlug) {
          loadPosts(slug);
        }
      });
    });
  };

  const renderEmptyState = (message) => {
    if (!postsBody) return;
    postsBody.innerHTML =
      '<tr class="community-empty-row"><td colspan="5">게시글이 아직 없습니다</td></tr>';
    updatePagination(1, 1);
    status.message(message || "게시글이 아직 없습니다");
  };

  // 목록에서는 삭제 버튼을 노출하지 않습니다 (상세 화면에서 처리)
  const attachDeleteHandlers = () => {};

  const renderRows = (items) => {
    if (!postsBody) return;
    if (!items.length) {
      renderEmptyState("조건에 맞는 게시글이 없습니다");
      return;
    }

    const activeBoard = boards.find((board) => board.slug === activeSlug);

    const rows = items
      .map((post) => {
        const isNotice =
          String(post.type || "").toUpperCase().includes("NOTICE") ||
          Boolean(post.notice || post.isNotice || post.pinned);
        const categoryRaw =
          post.category || post.topic || post.badge || (post.tags && post.tags[0]);
        const categoryDisplay = isNotice
          ? "공지"
          : categoryRaw
          ? normalizeText(categoryRaw)
          : activeBoard?.name || "자유";

        const titleText = normalizeText(post.title || "제목 없음");
        const commentCount = Number(
          post.commentCount ?? (Array.isArray(post.comments) ? post.comments.length : 0)
        );
        const commentHtml = commentCount > 0 ? `<span class="comment-count">[${commentCount}]</span>` : "";
        const authorText = normalizeText(
          post.author ||
            post.writer ||
            post.nickname ||
            post.userName ||
            (post.userId ? `회원 #${post.userId}` : "-")
        );
        const createdAt = formatDate(post.createdAt);
        const viewCount = Number(post.viewCount ?? post.views ?? post.hit ?? 0);
        const recommendCount = Number(post.likeCount ?? post.recommendCount ?? 0);
        // 목록 화면에서는 삭제 버튼을 제공하지 않음
        const deleteButton = "";

        const titleLink = post.id
          ? `community-post.html?id=${encodeURIComponent(post.id)}`
          : "#";

        return `
          <tr class="${isNotice ? "row-notice" : ""}">
            <td class="col-title">
              <div class="title-cell">
                <span class="title-badge">${escapeHtml(categoryDisplay)}</span>
                <a class="title-link" href="${titleLink}">
                  ${escapeHtml(titleText)}${commentHtml}
                </a>
              </div>
            </td>
            <td class="col-author">${escapeHtml(authorText)}</td>
            <td class="col-date">${createdAt}</td>
            <td class="col-views">${viewCount.toLocaleString()}</td>
            <td class="col-recommends">
              <span>${recommendCount.toLocaleString()}</span>
              ${deleteButton}
            </td>
          </tr>
        `;
      })
      .join("");

    postsBody.innerHTML = rows;
    attachDeleteHandlers();
    status.clear();
  };

  const renderCurrentPage = () => {
    const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
    const safePage = Math.min(Math.max(currentPage, 1), totalPages);
    currentPage = safePage;
    const start = (safePage - 1) * PAGE_SIZE;
    const currentItems = filteredPosts.slice(start, start + PAGE_SIZE);
    renderRows(currentItems);
    updatePagination(safePage, totalPages);
  };

  const applyFilters = () => {
    const keyword = (searchInput?.value || "").trim().toLowerCase();
    filteredPosts = allPosts.filter((post) => {
      if (!keyword) return true;
      const targets = [
        post.title,
        post.summary,
        post.content,
        post.author,
        post.category
      ]
        .filter(Boolean)
        .map((value) => normalizeText(value).toLowerCase());
      return targets.some((value) => value.includes(keyword));
    });
    currentPage = 1;
    renderCurrentPage();
  };

  const loadMockPosts = (boardSlug, message) => {
    const mockPosts = MOCK_COMMUNITY.posts[boardSlug] || [];
    allPosts = mockPosts.map((post, index) => ({
      ...post,
      id: post.id || `${boardSlug}-mock-${index + 1}`,
      createdAt: post.createdAt || new Date().toISOString()
    }));
    applyFilters();
    if (message) {
      status.message(message);
    } else {
      status.clear();
    }
  };

  const loadMockBoards = (message) => {
    boards = MOCK_COMMUNITY.boards.map((board) => ({ ...board }));
    const requestedExists = boards.some((board) => board.slug === requestedBoard);
    const defaultBoard = boards.find((board) => board.slug === "free") || boards[0];
    activeSlug = requestedExists ? requestedBoard : defaultBoard.slug;
    renderBoards();
    loadMockPosts(activeSlug, message || "샘플 게시글을 보여주는 중입니다.");
  };

  const loadPosts = (boardSlug) => {
    activeSlug = boardSlug;
    renderBoards();
    if (!postsBody) return;
    postsBody.innerHTML = skeleton();
    paginationEl?.setAttribute("hidden", "");

    if (preferMock) {
      loadMockPosts(boardSlug, "샘플 게시글을 불러왔습니다.");
      return;
    }

    status.loading("게시글을 불러오는 중입니다...");

    fetch(`${COMMUNITY_API_BASE}/posts?board=${encodeURIComponent(boardSlug)}`)
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((data) => {
        allPosts = Array.isArray(data?.content) ? data.content : [];
        applyFilters();
        status.clear();
      })
      .catch(() => {
        status.error("게시글을 불러오지 못했어요. 샘플 데이터를 보여줄게요.");
        loadMockPosts(boardSlug);
      });
  };

  const loadBoards = () => {
    if (!boardsEl) return;

    if (preferMock) {
      loadMockBoards("샘플 게시판/게시글을 보여주는 중입니다.");
      return;
    }

    status.loading("게시판 목록을 불러오는 중입니다...");
    boardsEl.textContent = "게시판을 불러오는 중...";

    fetch(`${COMMUNITY_API_BASE}/boards`)
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((data) => {
        boards = Array.isArray(data) ? data : [];
        if (!boards.length) {
          status.error("게시판 목록이 비어 있어요. 샘플 데이터를 보여줄게요.");
          loadMockBoards();
          return;
        }
        boards.sort((a, b) => {
          if (a.slug === "free") return b.slug === "free" ? 0 : -1;
          if (b.slug === "free") return 1;
          return a.name.localeCompare(b.name);
        });
        const requestedExists = boards.some((board) => board.slug === requestedBoard);
        const defaultBoard = boards.find((board) => board.slug === "free") || boards[0];
        activeSlug = requestedExists ? requestedBoard : defaultBoard.slug;
        renderBoards();
        loadPosts(activeSlug);
      })
      .catch(() => {
        status.error("게시판을 불러오지 못했어요. 샘플 데이터를 보여줄게요.");
        loadMockBoards();
      });
  };

  // 삭제는 상세 페이지에서 처리합니다.

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
  try {
    return decodeURIComponent(escape(text));
  } catch {
    return String(text);
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
