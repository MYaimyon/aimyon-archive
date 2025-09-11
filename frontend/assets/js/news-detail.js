// News detail: read id param, fetch JSON, render
document.addEventListener('DOMContentLoaded', () => {
  const qs = new URLSearchParams(location.search);
  const id = qs.get('id') || '';
  const fmtDate = (iso) => {
    try { const d = new Date(iso); const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0'); return `${y}.${m}.${day}`; } catch { return iso; }
  };
  const badgeLabel = (cat) => cat === 'event' ? '이벤트' : '소식';
  const badgeClass = (cat) => cat === 'event' ? 'badge badge-event' : 'badge badge-news';

  const el = {
    badge: document.getElementById('ndBadge'),
    title: document.getElementById('ndTitle'),
    date: document.getElementById('ndDate'),
    thumb: document.getElementById('ndThumb'),
    content: document.getElementById('ndContent')
  };

  el.content.innerHTML = '<p style="opacity:.7">불러오는 중...</p>';

  fetch('../data/news.json')
    .then(r => r.json())
    .then(data => {
      const items = data.items || [];
      const item = items.find(it => it.id === id) || items[0];
      if (!item) throw new Error('no item');

      el.badge.className = badgeClass(item.category);
      el.badge.textContent = badgeLabel(item.category);
      el.title.textContent = item.title;
      el.date.textContent = fmtDate(item.date);
      el.thumb.src = item.thumbnail;
      el.thumb.alt = item.title;
      el.thumb.onerror = () => { el.thumb.src = 'https://via.placeholder.com/960x540/555/ffffff?text=No+Image'; };
      el.content.innerHTML = item.contentHtml || '<p>내용 없음</p>';
    })
    .catch(() => {
      el.content.innerHTML = '<p style="color:var(--text-secondary)">뉴스를 불러오지 못했습니다.</p>';
    });
});

