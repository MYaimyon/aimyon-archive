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

const MOCK_ALBUMS = {
  "mock-album-1": {
    id: "mock-album-1",
    titleJa: "Shunkanteki Six Sense",
    titleKo: "Sunganjeogin Six Sense",
    type: "ALBUM",
    releaseDate: "2019-02-13",
    tags: ["Band Sound", "Aimyon"],
    description:
      "A punchy full-length album packed with guitar-driven arrangements and Aimyon's everyday storytelling.",
    coverUrl:
      "https://i.scdn.co/image/ab67616d0000b2732a7b82d49f683e4c2aaca5ae",
    tracks: [
      { id: "mock-track-1", trackNo: 1, titleJa: "Marigold", titleKo: "Marigold" },
      {
        id: "mock-track-2",
        trackNo: 2,
        titleJa: "Ai o Tsutaetai Datoka",
        titleKo: "Love I Want to Tell You"
      },
      { id: "mock-track-3", trackNo: 3, titleJa: "Sakura ga Furu Yoru wa", titleKo: "When Sakura Falls" }
    ]
  },
  "mock-album-2": {
    id: "mock-album-2",
    titleJa: "Heard That There's Good Pasta",
    titleKo: "Good Pasta",
    type: "SINGLE",
    releaseDate: "2020-09-09",
    tags: ["Acoustic", "Chill"],
    description: "A breezy single born from Aimyon's love of late-night diners and slow conversations.",
    coverUrl:
      "https://i.scdn.co/image/ab67616d0000b27350894b1c06b9d3170f12aee2",
    tracks: [
      { id: "mock-track-4", trackNo: 1, titleJa: "Good Night Baby", titleKo: "Good Night Baby" },
      { id: "mock-track-5", trackNo: 2, titleJa: "Morning Pasta", titleKo: "Morning Pasta" }
    ]
  },
  "mock-album-3": {
    id: "mock-album-3",
    titleJa: "Falling into Your Eyes Record",
    titleKo: "Falling into Your Eyes",
    type: "EP",
    releaseDate: "2022-05-11",
    tags: ["Drama OST", "Ballad"],
    description:
      "An EP that captures the emotional arc of a drama soundtrack, balancing tender ballads with cinematic builds.",
    coverUrl:
      "https://i.scdn.co/image/ab67616d0000b2731b2e08ce56d69d0e94d55bd5",
    tracks: [
      { id: "mock-track-6", trackNo: 1, titleJa: "Forever You", titleKo: "Forever You" }
    ]
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const albumId = params.get("id");
  const preferMock = params.get("mock") === "1";

  const detailContainer = document.querySelector(".album-detail");
  const statusEl = document.querySelector(".album-detail-status");
  const status = createStatusManager(statusEl, "album-detail-status");
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
    status.error("Album ID is required.");
    return;
  }

  if (preferMock) {
    const mockAlbum = pickMockAlbum(albumId);
    if (mockAlbum) {
      render(mockAlbum, { statusMessage: "Showing sample album data." });
      return;
    }
  }

  fetchAlbum(albumId);

  async function fetchAlbum(id) {
    status.loading("Loading album details...");
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
      const fallbackAlbum = pickMockAlbum(id);
      if (fallbackAlbum) {
        render(fallbackAlbum, {
          statusMessage: "Showing fallback sample album data."
        });
        return;
      }
      status.error("We could not load this album. Please try again later.");
    }
  }

  function render(album, options = {}) {
    const titleJa = album.titleJa || "Untitled Album";
    titleJaEl.textContent = titleJa;

    if (album.titleKo) {
      titleKoEl.textContent = album.titleKo;
      titleKoEl.style.display = "";
    } else {
      titleKoEl.textContent = "";
      titleKoEl.style.display = "none";
    }

    typeEl.textContent = mapAlbumType(album.type);
    releaseEl.textContent = album.releaseDate ? formatDate(album.releaseDate) : "Release date TBD";

    if (Array.isArray(album.tags) && album.tags.length > 0) {
      tagsEl.innerHTML = album.tags
        .map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`)
        .join("");
    } else {
      tagsEl.innerHTML = "";
    }

    descEl.textContent = album.description || "Album description will be added soon.";

    const cover =
      album.coverUrl && album.coverUrl.trim() !== ""
        ? album.coverUrl
        : "https://via.placeholder.com/480x480/555/ffffff?text=No+Image";
    coverEl.src = cover;
    coverEl.alt = `${titleJa} cover art`;
    coverEl.onerror = () => {
      coverEl.src = "https://via.placeholder.com/480x480/555/ffffff?text=No+Image";
    };

    renderTracks(album.tracks || []);
    detailContainer.dataset.state = "loaded";

    if (options.statusMessage) {
      status.message(options.statusMessage);
    } else {
      status.clear();
    }
  }

  function renderTracks(tracks) {
    if (!trackBodyEl) return;
    const sorted = tracks.slice().sort((a, b) => (a.trackNo ?? 0) - (b.trackNo ?? 0));

    if (!sorted.length) {
      trackBodyEl.innerHTML =
        '<div class="track track-empty"><span class="track-meta">No track data yet.</span></div>';
      if (trackCountEl) trackCountEl.textContent = "0 tracks";
      return;
    }

    if (trackCountEl) {
      trackCountEl.textContent = `${sorted.length} track${sorted.length > 1 ? "s" : ""}`;
    }

    trackBodyEl.innerHTML = sorted
      .map((track) => {
        const trackHref = track.id ? `song-detail.html?id=${encodeURIComponent(track.id)}` : null;
        const titleJa = escapeHtml(track.titleJa || "Untitled");
        const titleKo = track.titleKo ? `<p class="track-subtitle">${escapeHtml(track.titleKo)}</p>` : "";
        const duration = track.duration ? escapeHtml(track.duration) : "";
        const titleContent = trackHref
          ? `<a href="${trackHref}" class="track-title">${titleJa}</a>`
          : `<span class="track-title">${titleJa}</span>`;

        return `
          <div class="track">
            <span class="track-num">${track.trackNo ?? "-"}</span>
            <div class="track-meta">
              ${titleContent}
              ${titleKo}
            </div>
            <span class="track-duration">${duration}</span>
          </div>
        `;
      })
      .join("");
  }
});

function mapAlbumType(type) {
  const mapping = {
    ALBUM: "Full Album",
    SINGLE: "Single",
    EP: "EP"
  };
  if (!type) return "Unknown";
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

function pickMockAlbum(id) {
  if (id && Object.prototype.hasOwnProperty.call(MOCK_ALBUMS, id)) {
    return MOCK_ALBUMS[id];
  }
  const all = Object.values(MOCK_ALBUMS);
  return all.length ? all[0] : null;
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
