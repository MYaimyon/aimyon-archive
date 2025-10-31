const HOME_NEWS_API = "http://localhost:8080/api/news-events?size=6";

document.addEventListener("DOMContentLoaded", () => {
  const listEl = document.getElementById("homeEventsList");
  const statusEl = document.getElementById("homeEventsStatus");

  if (!listEl) {
    return;
  }

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
      const response = await fetch(HOME_NEWS_API, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`status ${response.status}`);
      }

      const payload = await response.json();
      const raw = Array.isArray(payload.content) ? payload.content : [];

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
});
