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
  const formEl = document.getElementById("communityComposeForm");
  const boardSelect = document.getElementById("composeBoard");
  const titleInput = document.getElementById("composeTitle");
  const contentInput = document.getElementById("composeContent");
  const statusEl = document.getElementById("composeStatus");
  const userIdEl = document.getElementById("composeUserId");
  const submitBtn = formEl?.querySelector(".compose-submit");

  const userId = getOrCreateUserId();
  if (userIdEl) {
    userIdEl.textContent = userId;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const requestedBoard = urlParams.get("board");

  const setStatus = (message, type = "info") => {
    if (!statusEl) return;
    statusEl.textContent = message || "";
    statusEl.className = "compose-status";
    if (type === "success") statusEl.classList.add("success");
    if (type === "error") statusEl.classList.add("error");
  };

  const populateBoards = () => {
    if (!boardSelect) return;
    boardSelect.innerHTML = '<option value="">게시판을 선택하세요</option>';
    fetch(`${COMMUNITY_API_BASE}/boards`)
      .then((res) => res.json())
      .then((boards) => {
        if (!Array.isArray(boards) || boards.length === 0) {
          boardSelect.innerHTML = '<option value="" disabled>게시판이 없습니다</option>';
          boardSelect.disabled = true;
          return;
        }
        const options = boards
          .map((board) => `<option value="${board.slug}">${board.name}</option>`)
          .join("");
        boardSelect.insertAdjacentHTML("beforeend", options);
        if (requestedBoard && boards.some((board) => board.slug === requestedBoard)) {
          boardSelect.value = requestedBoard;
        }
      })
      .catch(() => {
        boardSelect.innerHTML = '<option value="" disabled>게시판을 불러오지 못했어요</option>';
        boardSelect.disabled = true;
      });
  };

  populateBoards();

  formEl?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!boardSelect || !titleInput || !contentInput) return;

    const boardSlug = boardSelect.value.trim();
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!boardSlug) {
      setStatus("게시판을 선택해 주세요.", "error");
      boardSelect.focus();
      return;
    }
    if (!title || !content) {
      setStatus("제목과 내용을 모두 입력해 주세요.", "error");
      return;
    }

    setStatus("등록 중입니다...");
    submitBtn?.setAttribute("disabled", "");

    fetch(`${COMMUNITY_API_BASE}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        boardSlug,
        title,
        content
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error("create failed");
        return res.json();
      })
      .then(() => {
        setStatus("등록이 완료되었습니다! 잠시 후 목록으로 이동합니다.", "success");
        setTimeout(() => {
          window.location.href = `community.html?board=${encodeURIComponent(boardSlug)}`;
        }, 1200);
      })
      .catch(() => {
        setStatus("게시글 등록에 실패했습니다. 다시 시도해 주세요.", "error");
      })
      .finally(() => {
        submitBtn?.removeAttribute("disabled");
      });
  });
});
