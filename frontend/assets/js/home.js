// Home page scripts: Events list + dynamic MUSIC VIDEOS (random 4)

// API bases (dynamic for local/prod)
const HOME_API_BASE = (() => {
  if (window.location.protocol === "file:") return "http://localhost:8080/api";
  const { protocol, hostname, port } = window.location;
  if (port && port !== "" && port !== "8080") return `${protocol}//${hostname}:8080/api`;
  return "/api";
})();

const HOME_NEWS_API = `${HOME_API_BASE}/news-events?size=6`;
const HOME_TRACKS_API_BASE = `${HOME_API_BASE}/tracks`;

document.addEventListener("DOMContentLoaded", () => {
  // ======= News & Events =======
  const listEl = document.getElementById("homeEventsList");
  const statusEl = document.getElementById("homeEventsStatus");

  if (listEl) {
    const setStatus = (message) => {
      if (!statusEl) return;
      statusEl.textContent = message;
    };

    const formatDate = (iso) => {
      if (!iso) return "-";
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) return iso;
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}.${m}.${d}`;
    };

    const renderSkeleton = () => {
      listEl.innerHTML = Array.from({ length: 4 })
        .map(
          () => `
          <li class="events-board__item skeleton">
            <span class="events-board__date shimmer"></span>
            <span class="events-board__title shimmer"></span>
            <span class="events-board__location shimmer"></span>
          </li>`
        )
        .join("");
    };

    const renderItems = (items) => {
      if (!items.length) {
        listEl.innerHTML = `
          <li class="events-board__item events-board__item--empty">
            <span class="events-board__title">표시할 일정이 없어요.</span>
          </li>`;
        setStatus("표시할 일정이 없어요.");
        return;
      }

      listEl.innerHTML = items
        .map(
          (item) => `
          <li class="events-board__item">
            <span class="events-board__date">${formatDate(item.date)}</span>
            <span class="events-board__title">${item.title}</span>
            <span class="events-board__location">${item.location || "-"}</span>
          </li>`
        )
        .join("");

      setStatus(`최신 일정 ${items.length}건을 불러왔어요.`);
    };

    const loadEvents = async () => {
      renderSkeleton();
      setStatus("최신 일정을 불러오는 중이에요.");
      try {
        const response = await fetch(HOME_NEWS_API, { headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(`status ${response.status}`);
        const payload = await response.json();
        const raw = Array.isArray(payload?.content) ? payload.content : [];
        const mapped = raw
          .map((item) => ({
            id: item.id,
            title: item.title || "(제목 미정)",
            date: item.eventDate || item.createdAt,
            location: item.location || "",
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 4);
        renderItems(mapped);
      } catch (error) {
        listEl.innerHTML = `
          <li class="events-board__item events-board__item--error">
            <span class="events-board__title">일정을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</span>
          </li>`;
        setStatus("일정을 불러오지 못했어요.");
        console.error("Failed to load home events:", error);
      }
    };

    loadEvents();
  }

  // ======= MUSIC VIDEOS (random 4) =======
  const grid = document.querySelector(".home-videos .video-grid");
  if (grid) {
    loadHomeVideos(grid).catch(() => {});
  }
});

// MUSIC VIDEOS: pick 4 random tracks with mvUrl and render to home grid
async function loadHomeVideos(gridEl) {
  try {
    const tracks = await fetchTracksWithMv();
    if (!tracks.length) return;
    const candidates = tracks.filter((t) => typeof t.mvUrl === "string" && t.mvUrl.trim().length > 0);
    if (!candidates.length) return;
    const picked = pickRandom(candidates, 4)
      .map((t) => ({ track: t, embed: getEmbedUrl(t.mvUrl) }))
      .filter((x) => !!x.embed);
    if (!picked.length) return;
    gridEl.innerHTML = picked.map(({ track, embed }) => renderVideoCard(track, embed)).join("");
  } catch (_e) {
    // ignore errors; leave existing content
  }
}

async function fetchTracksWithMv() {
  const res = await fetch(`${HOME_TRACKS_API_BASE}?size=500`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  let list = Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : []);
  const seen = new Set();
  list = list.filter((t) => {
    const u = (t && typeof t.mvUrl === "string") ? t.mvUrl.trim() : "";
    if (!u) return false;
    if (seen.has(u)) return false;
    seen.add(u);
    return true;
  });
  return list;
}

function renderVideoCard(track, embedUrl) {
  const title = escapeHtml(track.titleJa || track.titleKo || "Untitled");
  const year = getReleaseYearFromTrack(track) || "";
  const meta = `Official Music Video${year ? " " + year : ""}`;
  return `
    <article class="video-card">
      <div class="video-card__frame">
        <iframe
          src="${embedUrl}"
          title="Aimyon - ${title}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen></iframe>
      </div>
      <h3 class="video-card__title">${title}</h3>
      <p class="video-card__meta">${meta}</p>
    </article>`;
}

function pickRandom(arr, n) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

function getReleaseYearFromTrack(track) {
  const d = track?.album?.releaseDate;
  if (!d) return null;
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return null;
  return date.getFullYear();
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Minimal YouTube embed resolver (aligned with song-detail.js)
function getEmbedUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (host.endsWith("youtu.be")) {
      const id = parsed.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host.endsWith("youtube.com")) {
      if (parsed.pathname.startsWith("/embed/")) {
        return `https://www.youtube.com${parsed.pathname}`;
      }
      if (parsed.pathname === "/watch") {
        const videoId = parsed.searchParams.get("v");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }
    }
  } catch (_e) {
    return null;
  }
  return null;
}

