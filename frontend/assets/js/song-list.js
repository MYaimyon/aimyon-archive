const TRACKS_API_BASE = (() => {
  if (window.location.protocol === "file:") {
    return "http://localhost:8080/api/tracks";
  }
  const { protocol, hostname, port } = window.location;
  if (port && port !== "" && port !== "8080") {
    return `${protocol}//${hostname}:8080/api/tracks`;
  }
  return "/api/tracks";
})();

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".songs-grid");
  const searchInput = document.getElementById("searchInput");
  const resetBtn = document.getElementById("resetBtn");
  const filterTabs = Array.from(document.querySelectorAll(".filter-tab"));
  const countEl = document.getElementById("songCount");

  if (!grid) return;

  let tracks = [];
  let currentFilter = "all";
  let searchTerm = "";

  grid.innerHTML = renderStatus("곡 목록을 불러오는 중입니다...");

  fetchTracks();

  filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      filterTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentFilter = tab.dataset.filter || "all";
      render();
    });
  });

  searchInput?.addEventListener("input", () => {
    searchTerm = searchInput.value.trim().toLowerCase();
    render();
    toggleResetButton();
  });

  resetBtn?.addEventListener("click", () => {
    searchTerm = "";
    searchInput.value = "";
    render();
    toggleResetButton();
  });

  async function fetchTracks() {
    try {
      const response = await fetch(`${TRACKS_API_BASE}?size=500`, {
        headers: { Accept: "application/json" }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        tracks = data;
      } else if (Array.isArray(data.content)) {
        tracks = data.content;
      } else {
        tracks = [];
      }
      render();
    } catch (error) {
      console.error("Failed to load tracks", error);
      grid.innerHTML = renderStatus("곡 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.", true);
    }
  }

  function render() {
    if (!tracks.length) {
      grid.innerHTML = renderStatus("등록된 곡이 아직 없어요.");
      updateCount(0);
      return;
    }

    const filteredByCategory = tracks.filter((track) => {
      const year = getReleaseYear(track);
      if (currentFilter === "early") return year && year <= 2016;
      if (currentFilter === "major") return year && year >= 2017 && year <= 2019;
      if (currentFilter === "recent") return year && year >= 2020;
      return true;
    });

    const filtered = filteredByCategory.filter((track) => {
      if (!searchTerm) return true;
      const fields = [track.titleJa, track.titleKo, track.album?.titleJa, track.album?.titleKo];
      return fields.some((value) => value && value.toLowerCase().includes(searchTerm));
    });

    if (!filtered.length) {
      grid.innerHTML = renderStatus("선택한 조건에 해당하는 곡이 없어요.");
      updateCount(0);
      return;
    }

    updateCount(filtered.length);

    grid.innerHTML = filtered
      .map((track) => {
        const albumTitle = track.album ? escapeHtml(track.album.titleJa || track.album.titleKo || "앨범 미정") : "앨범 미정";
        const year = getReleaseYear(track) || "발매년도 미정";
        return `
          <a class="song-card" href="song-detail.html?id=${track.id}">
            <div class="song-thumbnail">
              <div class="thumbnail-placeholder">♪</div>
            </div>
            <div class="song-info">
              <h3 class="song-title-jp">${escapeHtml(track.titleJa || "제목 미정")}</h3>
              ${track.titleKo ? `<p class="song-title-kr">${escapeHtml(track.titleKo)}</p>` : ""}
              <div class="song-meta">
                <span class="album-name">${albumTitle}</span>
                <span class="release-year">${year}</span>
              </div>
            </div>
          </a>
        `;
      })
      .join("");
  }

  function updateCount(count) {
    if (countEl) {
      countEl.textContent = `${count}곡`;
    }
  }

  function toggleResetButton() {
    if (!resetBtn) return;
    resetBtn.style.display = searchTerm ? "inline-flex" : "none";
  }
});

function renderStatus(message, isError = false) {
  return `<div class="album-status${isError ? " error" : ""}">${message}</div>`;
}

function getReleaseYear(track) {
  if (track.album?.releaseDate) {
    const date = new Date(track.album.releaseDate);
    if (!Number.isNaN(date.getTime())) {
      return date.getFullYear();
    }
  }
  return null;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
