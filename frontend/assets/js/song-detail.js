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

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const trackId = params.get("id");

  const detailContainer = document.querySelector(".song-detail");
  const statusEl = document.querySelector(".song-detail-status");
  const titleJaEl = document.getElementById("track-title-ja");
  const titleKoEl = document.getElementById("track-title-ko");
  const metaAlbumEl = document.getElementById("track-album");
  const metaDurationEl = document.getElementById("track-duration");
  const lyricsSummaryEl = document.getElementById("lyrics-summary");
  const storyPaneEl = document.getElementById("story");
  const mvLinkEl = document.getElementById("mv-link");
  const infoAlbumEl = document.getElementById("info-album");
  const infoTrackNoEl = document.getElementById("info-trackno");
  const infoDurationEl = document.getElementById("info-duration");
  const infoTypeEl = document.getElementById("info-type");
  const infoReleaseEl = document.getElementById("info-release");
  const relatedGridEl = document.getElementById("related-grid");
  const relatedSectionEl = document.getElementById("related-section");

  if (!trackId) {
    setStatus("곡 식별자가 없습니다.", true);
    return;
  }

  setupTabs();
  fetchTrack(trackId);

  async function fetchTrack(id) {
    setStatus("곡 정보를 불러오는 중입니다...");
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
      console.error("곡 상세 불러오기 실패", error);
      setStatus("곡 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.", true);
    }
  }

  function render(track) {
    const titleJa = track.titleJa || "곡 제목 미정";
    titleJaEl.textContent = titleJa;

    if (track.titleKo) {
      titleKoEl.textContent = track.titleKo;
      titleKoEl.style.display = "";
    } else {
      titleKoEl.textContent = "";
      titleKoEl.style.display = "none";
    }

    if (track.album) {
      const albumLink = `album-detail.html?id=${track.album.id}`;
      metaAlbumEl.innerHTML = `<a href="${albumLink}">${escapeHtml(track.album.titleJa || "앨범")}</a>`;
      infoAlbumEl.innerHTML = `<a href="${albumLink}">${escapeHtml(track.album.titleJa || "앨범")}</a>`;
      infoTypeEl.textContent = mapAlbumType(track.album.type);
      infoReleaseEl.textContent = track.album.releaseDate ? formatDate(track.album.releaseDate) : "-";
    } else {
      metaAlbumEl.textContent = "";
      infoAlbumEl.textContent = "";
      infoTypeEl.textContent = "-";
      infoReleaseEl.textContent = "-";
    }

    metaDurationEl.textContent = track.duration ? `재생 시간 · ${track.duration}` : "";
    infoDurationEl.textContent = track.duration || "-";
    infoTrackNoEl.textContent = track.trackNo != null ? String(track.trackNo) : "-";

    lyricsSummaryEl.textContent = track.lyricsSummary || "가사가 준비 중입니다.";

    if (track.mvUrl) {
      mvLinkEl.href = track.mvUrl;
      mvLinkEl.style.display = "inline-flex";
    } else {
      mvLinkEl.style.display = "none";
    }

    renderStories(Array.isArray(track.stories) ? track.stories : []);
    renderRelated(Array.isArray(track.relatedTracks) ? track.relatedTracks : []);

    detailContainer.dataset.state = "loaded";
    setStatus("");
  }

  function renderStories(stories) {
    if (!storyPaneEl) return;
    if (!stories.length) {
      storyPaneEl.innerHTML = '<p class="placeholder">제작 배경/비하인드 스토리가 준비 중입니다.</p>';
      return;
    }
    storyPaneEl.innerHTML = stories.map(story => {
      const category = escapeHtml(story.category || "제작 배경/비하인드 스토리");
      const content = escapeHtml(story.content || "");
      const metaParts = [];
      if (story.source) metaParts.push(`출처 · ${escapeHtml(story.source)}`);
      if (story.publishedAt) metaParts.push(`발행일 · ${formatDate(story.publishedAt)}`);
      const meta = metaParts.length ? `<div class="story-meta">${metaParts.join(' · ')}</div>` : "";
      return `<article class="story-card"><h3>${category}</h3><p>${content}</p>${meta}</article>`;
    }).join("");
  }

  function renderRelated(related) {
    if (!relatedGridEl || !relatedSectionEl) return;
    if (!related.length) {
      relatedGridEl.innerHTML = '<p class="placeholder">관련 곡 정보가 없습니다.</p>';
      relatedSectionEl.style.display = "";
      return;
    }
    relatedGridEl.innerHTML = related.map(item => {
      const titleJa = escapeHtml(item.titleJa || "Untitled");
      const titleKo = item.titleKo ? `<p>${escapeHtml(item.titleKo)}</p>` : "";
      return `<a class="related-card" href="song-detail.html?id=${item.id}"><h3>${titleJa}</h3>${titleKo}</a>`;
    }).join("");
    relatedSectionEl.style.display = "";
  }

  function setStatus(message, isError = false) {
    if (!statusEl) return;
    if (!message) {
      statusEl.textContent = "";
      statusEl.className = "song-detail-status";
      return;
    }
    statusEl.textContent = message;
    statusEl.className = isError ? "song-detail-status error" : "song-detail-status";
  }
});

function setupTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const panes = document.querySelectorAll('.tab-pane');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      buttons.forEach(btn => btn.classList.remove('active'));
      panes.forEach(pane => pane.classList.remove('active'));
      button.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });
}

function mapAlbumType(type) {
  const mapping = {
    ALBUM: '정규 앨범',
    SINGLE: '싱글',
    EP: 'EP'
  };
  if (!type) return '-';
  return mapping[type.toUpperCase()] || type;
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}