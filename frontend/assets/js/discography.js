const ALBUMS_API_BASE = (() => {
  if (window.location.protocol === "file:") {
    return "http://localhost:8080/api/albums";
  }
  const { protocol, hostname, port } = window.location;
  if (port && port !== "" && port !== "8080") {
    return `${protocol}//${hostname}:8080/api/albums`;
  }
  return "/api/albums";
})();

document.addEventListener("DOMContentLoaded", () => {
  const filterTabs = Array.from(document.querySelectorAll(".filter-tab"));
  const grid = document.querySelector(".album-grid");
  const status = document.getElementById("albumCount");
  if (!grid) return;

  let albums = [];
  let currentFilter = "all";

  grid.innerHTML = createStatusMarkup("앨범 목록을 불러오는 중입니다...");

  filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      filterTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentFilter = tab.getAttribute("data-filter") || "all";
      render();
    });
  });

  fetchAlbums();

  async function fetchAlbums() {
    try {
      const response = await fetch(`${ALBUMS_API_BASE}?size=200`, {
        headers: { Accept: "application/json" }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        albums = data;
      } else if (Array.isArray(data.content)) {
        albums = data.content;
      } else {
        albums = [];
      }
      render();
    } catch (error) {
      console.error("Failed to load albums", error);
      grid.innerHTML = createStatusMarkup("앨범 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.", true);
    }
  }

  function render() {
    if (!albums.length) {
      grid.innerHTML = createStatusMarkup("등록된 앨범이 아직 없어요.");
      updateCount(0);
      return;
    }

    const filtered = currentFilter === "all"
      ? albums
      : albums.filter((album) => (album.type || "").toLowerCase() === currentFilter);

    if (!filtered.length) {
      grid.innerHTML = createStatusMarkup("선택한 조건에 해당하는 앨범이 없어요.");
      updateCount(0);
      return;
    }

    updateCount(filtered.length);

    grid.innerHTML = filtered
      .map((album) => {
        const cover = album.coverUrl && album.coverUrl.trim() !== ""
          ? album.coverUrl
          : "https://via.placeholder.com/320x320/555/ffffff?text=No+Image";
        const released = album.releaseDate ? formatDate(album.releaseDate) : "발매일 미정";
        const tags = Array.isArray(album.tags) ? album.tags : [];
        return `
          <a class="album-card" href="album-detail.html?id=${album.id}">
            <div class="album-cover">
              <img src="${cover}" alt="${escapeHtml(album.titleJa || album.titleKo || "album")}" loading="lazy">
            </div>
            <div class="album-info">
              <h3>${escapeHtml(album.titleJa || "제목 미정")}</h3>
              ${album.titleKo ? `<p class="album-subtitle">${escapeHtml(album.titleKo)}</p>` : ""}
              <p class="album-meta">${mapAlbumType(album.type)} · ${released}</p>
              ${tags.length ? `<div class="album-tags">${tags.map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
            </div>
          </a>
        `;
      })
      .join("");
  }

  function updateCount(count) {
    if (status) {
      status.textContent = `${count}개 앨범`;
    }
  }
});

function createStatusMarkup(message, isError = false) {
  return `<div class="album-status${isError ? " error" : ""}">${message}</div>`;
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

function mapAlbumType(type) {
  const mapping = {
    ALBUM: "정규 앨범",
    SINGLE: "싱글",
    EP: "EP"
  };
  if (!type) return "형식 미정";
  return mapping[type.toUpperCase()] || type;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
