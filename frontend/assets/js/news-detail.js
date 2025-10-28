const NEWS_API_BASE = (() => {
  if (window.location.protocol === "file:") {
    return "http://localhost:8080/api/news-events";
  }
  const { protocol, hostname, port } = window.location;
  if (port && port !== "" && port !== "8080") {
    return `${protocol}//${hostname}:8080/api/news-events`;
  }
  return "/api/news-events";
})();

document.addEventListener("DOMContentLoaded", () => {
  const qs = new URLSearchParams(location.search);
  const id = qs.get("id");

  const fmtDate = (iso) => {
    try {
      const d = new Date(iso);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}.${m}.${day}`;
    } catch {
      return iso;
    }
  };

  const badgeLabel = (cat) => cat === "event" ? "이벤트" : "뉴스";
  const badgeClass = (cat) => cat === "event" ? "badge badge-event" : "badge badge-news";
  const formatContentHtml = (text) => {
    if (!text) return "<p>내용이 준비 중입니다.</p>";
    return text
      .split(/\n{2,}/)
      .map((block) => `<p>${block.replace(/\n/g, "<br>")}</p>`)
      .join("");
  };

  const el = {
    badge: document.getElementById("ndBadge"),
    title: document.getElementById("ndTitle"),
    date: document.getElementById("ndDate"),
    thumb: document.getElementById("ndThumb"),
    content: document.getElementById("ndContent")
  };

  el.content.innerHTML = "<p style=\"opacity:.7\">불러오는 중...</p>";

  const loadData = async () => {
    if (id) {
      const res = await fetch(`${NEWS_API_BASE}/${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error("not found");
      return res.json();
    }
    const res = await fetch(`${NEWS_API_BASE}?size=1`);
    if (!res.ok) throw new Error("list failed");
    const data = await res.json();
    return (data.content && data.content[0]) || null;
  };

  loadData()
    .then((item) => {
      if (!item) throw new Error("no item");
      const category = (item.type || "NEWS").toLowerCase();

      el.badge.className = badgeClass(category);
      el.badge.textContent = badgeLabel(category);
      el.title.textContent = item.title || "";
      el.date.textContent = fmtDate(item.eventDate || item.createdAt);
      el.thumb.src = item.thumbnail || "";
      el.thumb.alt = item.title || "news thumbnail";
      el.thumb.onerror = () => {
        el.thumb.src = "https://via.placeholder.com/960x540/555/ffffff?text=No+Image";
      };
      el.content.innerHTML = formatContentHtml(item.content);
    })
    .catch(() => {
      el.content.innerHTML = "<p style=\"color:var(--text-secondary)\">콘텐츠를 불러오지 못했어요.</p>";
    });
});
