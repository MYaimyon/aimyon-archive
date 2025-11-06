const API_BASE_TRACK = (() => {
  if (window.location.protocol === "file:") {
    return "http://localhost:8080/api/tracks";
  }
  const { protocol, hostname, port } = window.location;
  if (port && port !== "" && port !== "8080") {
    return `${protocol}//${hostname}:8080/api/tracks`;
  }
  return "/api/tracks";
})();

const MOCK_TRACKS = {
  "mock-track-1": {
    id: "mock-track-1",
    titleJa: "Marigold",
    titleKo: "Marigold",
    duration: "4:56",
    trackNo: 1,
    lyricsSummary:
      "A warm-hearted love song that captures the feeling of sunshine and nostalgia.",
    mvUrl: "https://www.youtube.com/watch?v=0g9dL92X7kc",
    album: {
      id: "mock-album-1",
      titleJa: "Shunkanteki Six Sense",
      type: "ALBUM",
      releaseDate: "2019-02-13"
    },
    stories: [
      {
        category: "Production Story",
        content:
          "Aimyon noted that the opening riff appeared while traveling on tour and set the tone for the entire song.",
        sourceName: "Aimyon Interview",
        sourceUrl: "https://example.com/interview",
        language: "ja",
        publishedAt: "2019-08-01"
      }
    ],
    relatedTracks: [
      { id: "mock-track-2", titleJa: "Ai o Tsutaetai Datoka", titleKo: "Love I Want to Tell You" },
      { id: "mock-track-3", titleJa: "Sakura ga Furu Yoru wa", titleKo: "When Sakura Falls" }
    ]
  },
  "mock-track-2": {
    id: "mock-track-2",
    titleJa: "Ai o Tsutaetai Datoka",
    titleKo: "Love I Want to Tell You",
    duration: "4:05",
    trackNo: 2,
    lyricsSummary:
      "A candid monologue about wanting to speak honestly, wrapped in Aimyon's distinctive phrasing.",
    mvUrl: "https://www.youtube.com/watch?v=CEQ1QzG1iS0",
    album: {
      id: "mock-album-1",
      titleJa: "Shunkanteki Six Sense",
      type: "ALBUM",
      releaseDate: "2019-02-13"
    },
    stories: [],
    relatedTracks: [
      { id: "mock-track-1", titleJa: "Marigold", titleKo: "Marigold" },
      { id: "mock-track-4", titleJa: "Good Night Baby", titleKo: "Good Night Baby" }
    ]
  },
  "mock-track-3": {
    id: "mock-track-3",
    titleJa: "Sakura ga Furu Yoru wa",
    titleKo: "When Sakura Falls",
    duration: "4:07",
    trackNo: 3,
    lyricsSummary:
      "A ballad that balances the flutter of spring romance with a hint of melancholy.",
    mvUrl: "https://www.youtube.com/watch?v=Np7d4jvKp5g",
    album: {
      id: "mock-album-1",
      titleJa: "Shunkanteki Six Sense",
      type: "ALBUM",
      releaseDate: "2019-02-13"
    },
    stories: [
      {
        category: "Lyric Note",
        content: "Written after midnight while watching cherry blossoms fall in her hometown.",
        language: "ja"
      }
    ],
    relatedTracks: [
      { id: "mock-track-1", titleJa: "Marigold", titleKo: "Marigold" }
    ]
  },
  "mock-track-4": {
    id: "mock-track-4",
    titleJa: "Good Night Baby",
    titleKo: "Good Night Baby",
    duration: "3:58",
    trackNo: 1,
    lyricsSummary: "An acoustic lullaby celebrating quiet late-night moments after a long day.",
    mvUrl: "",
    album: {
      id: "mock-album-2",
      titleJa: "Heard That There's Good Pasta",
      type: "SINGLE",
      releaseDate: "2020-09-09"
    },
    stories: [],
    relatedTracks: [
      { id: "mock-track-5", titleJa: "Morning Pasta", titleKo: "Morning Pasta" }
    ]
  },
  "mock-track-5": {
    id: "mock-track-5",
    titleJa: "Morning Pasta",
    titleKo: "Morning Pasta",
    duration: "4:12",
    trackNo: 2,
    lyricsSummary: "A laid-back tune inspired by Aimyon's favorite breakfast cafes.",
    mvUrl: "",
    album: {
      id: "mock-album-2",
      titleJa: "Heard That There's Good Pasta",
      type: "SINGLE",
      releaseDate: "2020-09-09"
    },
    stories: [],
    relatedTracks: [
      { id: "mock-track-4", titleJa: "Good Night Baby", titleKo: "Good Night Baby" }
    ]
  },
  "mock-track-6": {
    id: "mock-track-6",
    titleJa: "Forever You",
    titleKo: "Forever You",
    duration: "5:01",
    trackNo: 1,
    lyricsSummary:
      "A soaring OST ballad written for the drama Falling into Your Eyes, focusing on unwavering devotion.",
    mvUrl: "",
    album: {
      id: "mock-album-3",
      titleJa: "Falling into Your Eyes Record",
      type: "EP",
      releaseDate: "2022-05-11"
    },
    stories: [],
    relatedTracks: [
      { id: "mock-track-3", titleJa: "Sakura ga Furu Yoru wa", titleKo: "When Sakura Falls" }
    ]
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const trackId = params.get("id");
  const preferMock = params.get("mock") === "1";

  const detailContainer = document.querySelector(".song-detail");
  const statusEl = document.querySelector(".song-detail-status");
  const status = createStatusManager(statusEl, "song-detail-status");

  const titleJaEl = document.getElementById("track-title-ja");
  const titleKoEl = document.getElementById("track-title-ko");
  const lyricsSummaryEl = document.getElementById("lyrics-summary");
  const storyPaneEl = document.getElementById("story");
  const mediaFrameEl = document.getElementById("mediaFrame");
  const mvLinkEl = document.getElementById("mv-link");
  const infoAlbumEl = document.getElementById("info-album");
  const infoTrackNoEl = document.getElementById("info-trackno");
  const infoDurationEl = document.getElementById("info-duration");
  const infoTypeEl = document.getElementById("info-type");
  const infoReleaseEl = document.getElementById("info-release");
  const relatedGridEl = document.getElementById("related-grid");
  const relatedSectionEl = document.getElementById("related-section");

  if (!trackId) {
    status.error("Track ID is required.");
    return;
  }

  setupTabs();

  if (preferMock) {
    const mockTrack = pickMockTrack(trackId);
    if (mockTrack) {
      render(mockTrack, { statusMessage: "Showing sample track data." });
      return;
    }
  }

  fetchTrack(trackId);

  async function fetchTrack(id) {
    status.loading("Loading track information...");
    try {
      const response = await fetch(`${API_BASE_TRACK}/${encodeURIComponent(id)}`, {
        headers: { Accept: "application/json" }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const track = await response.json();
      render(track);
    } catch (error) {
      console.error("Failed to load track", error);
      const fallbackTrack = pickMockTrack(id);
      if (fallbackTrack) {
        render(fallbackTrack, {
          statusMessage: "Showing fallback sample track data."
        });
        return;
      }
      status.error("We could not load this track. Please try again later.");
    }
  }

  function render(track, options = {}) {
    const titleJa = track.titleJa || "Untitled Track";
    titleJaEl.textContent = titleJa;

    if (track.titleKo) {
      titleKoEl.textContent = track.titleKo;
      titleKoEl.style.display = "";
    } else {
      titleKoEl.textContent = "";
      titleKoEl.style.display = "none";
    }

    if (track.album) {
      const albumLink =
        track.album.id != null
          ? `album-detail.html?id=${encodeURIComponent(track.album.id)}`
          : "#";
      const albumTitle = escapeHtml(track.album.titleJa || "Album");
      const albumAnchor = track.album.id ? `<a href="${albumLink}">${albumTitle}</a>` : albumTitle;
      infoAlbumEl.innerHTML = albumAnchor;
      infoTypeEl.textContent = mapAlbumType(track.album.type);
      infoReleaseEl.textContent = track.album.releaseDate ? formatDate(track.album.releaseDate) : "-";
    } else {
      infoAlbumEl.textContent = "";
      infoTypeEl.textContent = "-";
      infoReleaseEl.textContent = "-";
    }

    infoDurationEl.textContent = track.duration || "-";
    infoTrackNoEl.textContent = track.trackNo != null ? String(track.trackNo) : "-";

    lyricsSummaryEl.textContent = track.lyricsSummary || "Lyrics summary will be added soon.";

    if (mediaFrameEl) {
      mediaFrameEl.innerHTML = "";
      mediaFrameEl.hidden = true;
    }

    if (track.mvUrl) {
      const embedUrl = getEmbedUrl(track.mvUrl);
      if (embedUrl && mediaFrameEl) {
        mediaFrameEl.innerHTML = `
          <iframe
            src="${embedUrl}"
            title="Aimyon music video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            loading="lazy"
          ></iframe>
        `;
        mediaFrameEl.hidden = false;
      }
      if (mvLinkEl) {
        mvLinkEl.href = track.mvUrl;
        mvLinkEl.textContent = embedUrl ? "유튜브에서 보기" : "뮤직비디오 보기";
        mvLinkEl.style.display = "inline-flex";
      }
    } else if (mvLinkEl) {
      mvLinkEl.style.display = "none";
    }

    renderStories(Array.isArray(track.stories) ? track.stories : []);
    renderRelated(Array.isArray(track.relatedTracks) ? track.relatedTracks : []);

    detailContainer.dataset.state = "loaded";

    if (options.statusMessage) {
      status.message(options.statusMessage);
    } else {
      status.clear();
    }
  }

  function renderStories(stories) {
    if (!storyPaneEl) return;
    if (!stories.length) {
      storyPaneEl.innerHTML = '<p class="placeholder">Stories will be added soon.</p>';
      return;
    }

    storyPaneEl.innerHTML = stories
      .map((story) => {
        const category = escapeHtml(story.category || "Story");
        const content = escapeHtml(story.content || "").replace(/\n/g, "<br>");
        const metaParts = [];

        if (story.sourceName) {
          const sourceName = escapeHtml(story.sourceName);
          if (story.sourceUrl) {
            const sourceUrl = escapeHtml(story.sourceUrl);
            metaParts.push(
              `<a href="${sourceUrl}" target="_blank" rel="noopener">${sourceName}</a>`
            );
          } else {
            metaParts.push(sourceName);
          }
        }
        if (story.language) {
          metaParts.push(`Language ${escapeHtml(String(story.language).toUpperCase())}`);
        }
        if (story.publishedAt) {
          metaParts.push(`Published ${formatDate(story.publishedAt)}`);
        }

        const meta = metaParts.length ? `<div class="story-meta">${metaParts.join(" · ")}</div>` : "";

        return `<article class="story-card"><h3>${category}</h3><p>${content}</p>${meta}</article>`;
      })
      .join("");
  }

  function renderRelated(related) {
    if (!relatedGridEl || !relatedSectionEl) return;
    if (!related.length) {
      relatedGridEl.innerHTML = '<p class="placeholder">No related tracks yet.</p>';
      relatedSectionEl.style.display = "";
      return;
    }
    relatedGridEl.innerHTML = related
      .map((item) => {
        const titleJa = escapeHtml(item.titleJa || "Untitled");
        const titleKo = item.titleKo ? `<p>${escapeHtml(item.titleKo)}</p>` : "";
        const href = item.id ? `song-detail.html?id=${encodeURIComponent(item.id)}` : "#";
        const anchorContent = `<h3>${titleJa}</h3>${titleKo}`;
        return item.id
          ? `<a class="related-card" href="${href}">${anchorContent}</a>`
          : `<div class="related-card">${anchorContent}</div>`;
      })
      .join("");
    relatedSectionEl.style.display = "";
  }
});

function setupTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  const panes = document.querySelectorAll(".tab-pane");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-target");
      buttons.forEach((btn) => btn.classList.remove("active"));
      panes.forEach((pane) => pane.classList.remove("active"));
      button.classList.add("active");
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add("active");
    });
  });
}

function mapAlbumType(type) {
  const mapping = {
    ALBUM: "Full Album",
    SINGLE: "Single",
    EP: "EP"
  };
  if (!type) return "-";
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

function pickMockTrack(id) {
  if (id && Object.prototype.hasOwnProperty.call(MOCK_TRACKS, id)) {
    return MOCK_TRACKS[id];
  }
  const all = Object.values(MOCK_TRACKS);
  return all.length ? all[0] : null;
}

function getEmbedUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      const videoId = parsed.pathname.slice(1);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (host.endsWith("youtube.com")) {
      if (parsed.pathname.startsWith("/embed/")) {
        return `https://www.youtube.com${parsed.pathname}`;
      }
      if (parsed.pathname.startsWith("/watch")) {
        const videoId = parsed.searchParams.get("v");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }
      if (parsed.pathname.startsWith("/shorts/")) {
        const [, , id] = parsed.pathname.split("/");
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
    }
  } catch {
    return null;
  }
  return null;
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
