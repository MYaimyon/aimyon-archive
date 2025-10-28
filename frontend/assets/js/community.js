const COMMUNITY_API_BASE = "http://localhost:8080/api/community";

document.addEventListener("DOMContentLoaded", () => {
  const boardsEl = document.getElementById("communityBoards");
  const postsEl = document.getElementById("communityPosts");

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

  const renderBoards = () => {
    boardsEl.innerHTML = boards
      .map(
        (board, index) => `
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
        const snippet =
          (post.content || "").length > 140
            ? `${post.content.slice(0, 140)}…`
            : post.content || "내용 없음";
        return `
          <a href="community-post.html?id=${encodeURIComponent(post.id)}" class="community-card">
            <h3>${post.title || "제목 없음"}</h3>
            <p>${snippet.replace(/\n/g, "<br>")}</p>
            <div class="meta">
              <span>작성자 #${post.userId ?? "-"}</span>
              <span>좋아요 ${post.likeCount ?? 0}</span>
              <span>댓글 ${post.commentCount ?? 0}</span>
              <span>${formatDate(post.createdAt)}</span>
            </div>
          </a>
        `;
      })
      .join("");
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
    boardsEl.innerHTML = skeleton(2);
    fetch(`${COMMUNITY_API_BASE}/boards`)
      .then((res) => res.json())
      .then((data) => {
        boards = Array.isArray(data) ? data : [];
        activeSlug = boards[0]?.slug || null;
        renderBoards();
        if (activeSlug) {
          loadPosts(activeSlug);
        } else {
          postsEl.innerHTML =
            '<div class="community-empty"><p>생성된 게시판이 없어요.</p></div>';
        }
      })
      .catch(() => {
        boardsEl.innerHTML =
          '<div class="community-empty" style="width:100%;"><p>게시판 목록을 불러오지 못했어요.</p></div>';
      });
  };

  loadBoards();
});
