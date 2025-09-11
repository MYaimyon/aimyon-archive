// Discography page interactions
document.addEventListener('DOMContentLoaded', () => {
  // 1) Safe label fixes for title/subtitle and tabs (avoid editing large HTML with encoding issues)
  const titleEl = document.querySelector('.page-title');
  if (titleEl) titleEl.textContent = '디스코그래피';
  const subEl = document.querySelector('.page-subtitle');
  if (subEl) subEl.textContent = '아티스트의 발매작을 한눈에 확인해보세요';

  const tabAll = document.querySelector('.filter-tab[data-filter="all"]');
  const tabAlbum = document.querySelector('.filter-tab[data-filter="album"]');
  const tabSingle = document.querySelector('.filter-tab[data-filter="single"]');
  const tabEp = document.querySelector('.filter-tab[data-filter="ep"]');
  if (tabAll) tabAll.textContent = '전체';
  if (tabAlbum) tabAlbum.textContent = '정규 앨범';
  if (tabSingle) tabSingle.textContent = '싱글';
  if (tabEp) tabEp.textContent = 'EP';

  // 2) Tabs filtering
  const filterTabs = document.querySelectorAll('.filter-tab');
  const albumCards = document.querySelectorAll('.album-card');

  function applyFilter(filter) {
    albumCards.forEach(card => {
      const category = card.getAttribute('data-category');
      const show = filter === 'all' || category === filter;
      card.style.display = show ? 'block' : 'none';
    });
  }

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.getAttribute('data-filter') || 'all';
      applyFilter(filter);
    });
  });

  // Initialize
  applyFilter('all');

  // 3) Album play button -> navigate to album-detail.html (fallback when href="#")
  document.querySelectorAll('.album-card .btn-play').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const href = btn.getAttribute('href');
      if (!href || href === '#') {
        e.preventDefault();
        window.location.href = 'album-detail.html';
      }
    });
  });

  // 4) Fix image paths and sizing for images referenced as "images/..."
  document.querySelectorAll('.album-cover img').forEach(img => {
    const src = img.getAttribute('src') || '';
    if (src.startsWith('images/')) {
      const file = src.split('/').pop();
      img.setAttribute('src', `../assets/images/${file}`);
    }
    // ensure good fit inside square cover
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.display = 'block';
    img.setAttribute('loading', 'lazy');
    // graceful fallback when file is missing
    img.onerror = () => {
      img.onerror = null;
      img.src = 'https://via.placeholder.com/300x300/555/ffffff?text=No+Image';
    };
  });
});
