// News page: fetch JSON, render list, filter, date format, empty state
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.filter-tab');
  const listEl = document.getElementById('newsList');
  let allItems = [];
  let currentFilter = 'all';

  // helpers
  const fmtDate = (iso) => {
    try {
      const d = new Date(iso);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}.${m}.${day}`;
    } catch { return iso; }
  };

  const badgeLabel = (cat) => cat === 'event' ? '이벤트' : '소식';
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
    const items = allItems
      .filter(it => currentFilter === 'all' || it.category === currentFilter);

    if (!items.length) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="emoji">📰</div>
          <p>표시할 항목이 없습니다.</p>
        </div>`;
      return;
    }

    listEl.innerHTML = items.map(it => `
      <a href="news-detail.html?id=${encodeURIComponent(it.id)}" class="news-card" data-category="${it.category}" tabindex="0">
        <div class="news-thumb">
          <img src="${it.thumbnail}" alt="${it.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/640x360/555/ffffff?text=No+Image'">
          <span class="${badgeClass(it.category)}">${badgeLabel(it.category)}</span>
        </div>
        <h3 class="news-title">${it.title}</h3>
        <p class="news-excerpt">${it.excerpt}</p>
        <time class="news-date">${fmtDate(it.date)}</time>
      </a>
    `).join('');

    // keyboard access: Enter opens
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

  // init
  listEl.innerHTML = skeleton(6);
  fetch('../data/news.json')
    .then(r => r.json())
    .then(data => {
      allItems = (data.items || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
      applyFilter('all');
    })
    .catch(() => {
      listEl.innerHTML = `<div class="empty-state"><div class="emoji">⚠️</div><p>뉴스를 불러오지 못했습니다.</p></div>`;
    });

  tabs.forEach(tab => {
    tab.addEventListener('click', () => applyFilter(tab.getAttribute('data-filter')));
  });
});
