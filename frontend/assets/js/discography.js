const API_ENDPOINT = (() => {
  if (window.location.protocol === 'file:') {
    return 'http://localhost:8080/api/albums';
  }
  const { protocol, hostname, port } = window.location;
  if (port && port !== '' && port !== '8080') {
    return `${protocol}//${hostname}:8080/api/albums`;
  }
  return '/api/albums';
})();

document.addEventListener('DOMContentLoaded', () => {
  const filterTabs = Array.from(document.querySelectorAll('.filter-tab'));
  const grid = document.querySelector('.album-grid');
  if (!grid) return;

  let albums = [];
  let currentFilter = 'all';

  grid.innerHTML = createStatusMarkup('앨범 데이터를 불러오는 중입니다...');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.getAttribute('data-filter') || 'all';
      render();
    });
  });

  fetchAlbums();

  async function fetchAlbums() {
    try {
      const response = await fetch(API_ENDPOINT, { headers: { Accept: 'application/json' } });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      albums = Array.isArray(data.content) ? data.content : [];
      render();
    } catch (error) {
      console.error('디스코그래피 불러오기 실패', error);
      grid.innerHTML = createStatusMarkup('앨범 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.', true);
    }
  }

  function render() {
    if (!albums.length) {
      grid.innerHTML = createStatusMarkup('등록된 앨범이 아직 없습니다.');
      return;
    }

    const target = currentFilter === 'all'
      ? albums
      : albums.filter(album => (album.type || '').toLowerCase() === currentFilter);

    if (!target.length) {
      grid.innerHTML = createStatusMarkup('선택한 조건에 맞는 앨범이 없습니다.');
      return;
    }

    const fragment = document.createDocumentFragment();

    target.forEach(album => {
      const card = document.createElement('article');
      card.className = 'album-card';
      card.dataset.category = (album.type || '').toLowerCase() || 'album';
      card.innerHTML = createCardMarkup(album);
      const detailId = album.id ?? '';

      if (detailId !== '') {
        card.addEventListener('click', (event) => {
          const anchor = event.target.closest('.btn-play');
          if (anchor) {
            return;
          }
          window.location.href = `album-detail.html?id=${encodeURIComponent(detailId)}`;
        });
      }

      fragment.appendChild(card);
    });

    grid.innerHTML = '';
    grid.appendChild(fragment);
  }
});

function createCardMarkup(album) {
  const typeLabels = {
    ALBUM: '정규 앨범',
    SINGLE: '싱글',
    EP: 'EP'
  };

  const cover = album.coverUrl || 'https://via.placeholder.com/300x300/555/ffffff?text=No+Image';
  const titleJa = album.titleJa || 'Untitled';
  const titleKo = album.titleKo || '';
  const typeLabel = typeLabels[(album.type || '').toUpperCase()] || album.type || '';
  const releaseDate = formatDate(album.releaseDate);
  const tags = Array.isArray(album.tags) && album.tags.length > 0
    ? album.tags.map(tag => `<span class="tag">#${escapeHtml(tag)}</span>`).join('')
    : '';
  const detailLink = `album-detail.html?id=${album.id ?? ''}`;

  return `
    <div class="album-cover">
      <img src="${cover}" alt="${escapeHtml(titleJa)}" loading="lazy" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x300/555/ffffff?text=No+Image';">
      <div class="album-hover">
        <a href="${detailLink}" class="btn-play" aria-label="${escapeHtml(titleJa)} 상세"><i class="fas fa-play"></i></a>
      </div>
    </div>
    <div class="album-info">
      <h3>${escapeHtml(titleJa)}</h3>
      ${titleKo ? `<p class="album-subtitle">${escapeHtml(titleKo)}</p>` : ''}
      <p class="album-type">${escapeHtml(typeLabel)}</p>
      ${releaseDate ? `<p class="album-year">${releaseDate}</p>` : ''}
      <div class="album-tags">${tags}</div>
    </div>
  `;
}

function createStatusMarkup(message, isError = false) {
  const className = isError ? 'album-grid-status error' : 'album-grid-status';
  return `<div class="${className}">${escapeHtml(message)}</div>`;
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
