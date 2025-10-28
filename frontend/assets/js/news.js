// News page: load list from backend and render cards
const NEWS_API_BASE = "http://localhost:8080/api/news-events";

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.filter-tab');
  const listEl = document.getElementById('newsList');
  let allItems = [];
  let currentFilter = 'all';

  const fmtDate = (iso) => {
    try {
      const d = new Date(iso);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}.${m}.${day}`;
    } catch {
      return iso;
    }
  };

  const badgeLabel = (cat) => cat === 'event' ? '이벤트' : '뉴스';
  const badgeClass = (cat) => cat === 'event' ? 'badge badge-event' : 'badge badge-news';

  const skeleton = (n = 4) => Array.from({ length: n }).map(() => `
    <div class="news-card skeleton">
      <div class="thumb"></div>
      <div class="line w60"></div>
      <div class="line w90"></div>
      <div class="line w40"></div>
    </div>
  `).join('');

  const render = () => {
    const items = allItems.filter(it => currentFilter === 'all' || it.category === currentFilter);

    if (!items.length) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="emoji">😅</div>
          <p>표시할 항목이 아직 없어요.</p>
        </div>`;
      return;
    }

    listEl.innerHTML = items.map(it => `
      <a href="news-detail.html?id=${encodeURIComponent(it.id)}" class="news-card" data-category="${it.category}" tabindex="0">
        <div class="news-thumb">
          <img src="${it.thumbnail || 'https://via.placeholder.com/640x360/555/ffffff?text=No+Image'}" alt="${it.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/640x360/555/ffffff?text=No+Image'">
          <span class="${badgeClass(it.category)}">${badgeLabel(it.category)}</span>
        </div>
        <h3 class="news-title">${it.title}</h3>
        <p class="news-excerpt">${it.excerpt}</p>
        <time class="news-date">${fmtDate(it.date)}</time>
      </a>
    `).join('');

    listEl.querySelectorAll('.news-card').forEach(card => {
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') card.click();
      });
    });
  };

  const applyFilter = (filter) => {
    currentFilter = filter;
    tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-filter') === filter));
    render();
  };

  const loadNews = async () => {
    const res = await fetch(`${NEWS_API_BASE}?size=200`);
    if (!res.ok) throw new Error('fetch failed');
    const data = await res.json();
    const rawItems = data.content || [];

    allItems = rawItems.map(item => ({
      id: item.id,
      title: item.title || '',
      excerpt: item.summary || '',
      category: (item.type || 'NEWS').toLowerCase(),
      date: item.eventDate || item.createdAt,
      thumbnail: Array.isArray(item.tags) && item.tags.length > 0 ? item.tags[0] : ''
    })).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  listEl.innerHTML = skeleton(6);
  loadNews()
    .then(() => applyFilter('all'))
    .catch(() => {
      listEl.innerHTML = `<div class="empty-state"><div class="emoji">⚠️</div><p>뉴스를 불러오지 못했어요.</p></div>`;
    });

  tabs.forEach(tab => {
    tab.addEventListener('click', () => applyFilter(tab.getAttribute('data-filter')));
  });
});
