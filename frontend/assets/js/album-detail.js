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
  const params = new URLSearchParams(window.location.search);
  const albumId = params.get("id");

  const detailContainer = document.querySelector(".album-detail");
  const statusEl = document.querySelector(".album-detail-status");
  const titleJaEl = document.getElementById("album-title-ja");
  const titleKoEl = document.getElementById("album-title-ko");
  const typeEl = document.getElementById("album-type");
  const releaseEl = document.getElementById("album-release");
  const tagsEl = document.getElementById("album-tags");
  const descEl = document.getElementById("album-description");
  const coverEl = document.getElementById("album-cover");
  const trackCountEl = document.getElementById("track-count");
  const trackBodyEl = document.getElementById("tracklist-body");

  if (!albumId) {
    setStatus("앨범 ID가 필요합니다.", true);
    return;
  }

  fetchAlbum(albumId);

  async function fetchAlbum(id) {
    setStatus("앨범 정보를 불러오는 중입니다...");
    try {
      const response = await fetch(`${ALBUMS_API_BASE}/${encodeURIComponent(id)}`, {
        headers: { Accept: "application/json" }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const album = await response.json();
      render(album);
    } catch (error) {
      console.error("Failed to load album detail", error);
      setStatus("앨범 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.", true);
    }
  }

  function render(album) {
    const titleJa = album.titleJa || "제목 미정";
    titleJaEl.textContent = titleJa;

    if (album.titleKo) {
      titleKoEl.textContent = album.titleKo;
      titleKoEl.style.display = "";
    } else {
      titleKoEl.textContent = "";
      titleKoEl.style.display = "none";
    }

    typeEl.textContent = mapAlbumType(album.type);
    releaseEl.textContent = album.releaseDate ? formatDate(album.releaseDate) : "발매일 미정";

    if (Array.isArray(album.tags) && album.tags.length > 0) {
      tagsEl.innerHTML = album.tags
        .map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`)
        .join("");
    } else {
      tagsEl.innerHTML = "";
    }

    descEl.textContent = album.description || "앨범 소개가 준비 중입니다.";

    const cover = album.coverUrl && album.coverUrl.trim() !== ""
      ? album.coverUrl
      : "https://via.placeholder.com/480x480/555/ffffff?text=No+Image";
    coverEl.src = cover;
    coverEl.alt = `${titleJa} cover`;
    coverEl.onerror = () => {
      coverEl.src = "https://via.placeholder.com/480x480/555/ffffff?text=No+Image";
    };

    renderTracks(album.tracks || []);
    detailContainer.dataset.state = "loaded";
    setStatus("");
  }

  function renderTracks(tracks) {
    if (!trackBodyEl) return;
    if (!tracks.length) {
      trackBodyEl.innerHTML = "<tr><td colspan=\"3\">트랙 정보가 아직 없어요.</td></tr>";
      if (trackCountEl) trackCountEl.textContent = "0곡";
      return;
    }

    if (trackCountEl) trackCountEl.textContent = `${tracks.length}곡`;

    trackBodyEl.innerHTML = tracks
      .sort((a, b) => (a.trackNo ?? 0) - (b.trackNo ?? 0))
      .map(
        (track) => `
          <tr>
            <td>${track.trackNo ?? "-"}</td>
            <td><a href="song-detail.html?id=${track.id}">${escapeHtml(track.titleJa || "제목 미정")}</a></td>
            <td>${escapeHtml(track.titleKo || "")}</td>
          </tr>
        `
      )
      .join("");
  }

  function setStatus(message, isError = false) {
    if (!statusEl) return;
    if (!message) {
      statusEl.textContent = "";
      statusEl.className = "album-detail-status";
      return;
    }
    statusEl.textContent = message;
    statusEl.className = isError ? "album-detail-status error" : "album-detail-status";
  }
});

function mapAlbumType(type) {
  const mapping = {
    ALBUM: "정규 앨범",
    SINGLE: "싱글",
    EP: "EP"
  };
  if (!type) return "형식 미정";
  return mapping[type.toUpperCase()] || type;
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

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
