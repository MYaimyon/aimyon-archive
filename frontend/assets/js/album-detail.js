const API_BASE_ALBUM = (() => {
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
  const params = new URLSearchParams(window.location.search);
  const albumId = params.get('id');

  const detailContainer = document.querySelector('.album-detail');
  const statusEl = document.querySelector('.album-detail-status');
  const titleJaEl = document.getElementById('album-title-ja');
  const titleKoEl = document.getElementById('album-title-ko');
  const typeEl = document.getElementById('album-type');
  const releaseEl = document.getElementById('album-release');
  const tagsEl = document.getElementById('album-tags');
  const descEl = document.getElementById('album-description');
  const coverEl = document.getElementById('album-cover');
  const trackCountEl = document.getElementById('track-count');
  const trackBodyEl = document.getElementById('tracklist-body');

  if (!albumId) {
    setStatus('앨범 식별자가 없습니다.', true);
    return;
  }

  fetchAlbum(albumId);

  async function fetchAlbum(id) {
    setStatus('앨범 정보를 불러오는 중입니다...');
    try {
      const response = await fetch(`${API_BASE_ALBUM}/${encodeURIComponent(id)}`, {
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const album = await response.json();
      render(album);
    } catch (error) {
      console.error('앨범 상세 불러오기 실패', error);
      setStatus('앨범 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.', true);
    }
  }

  function render(album) {
    const titleJa = album.titleJa || '앰범 제목 미정';
    titleJaEl.textContent = titleJa;

    if (album.titleKo) {
      titleKoEl.textContent = album.titleKo;
      titleKoEl.style.display = '';
    } else {
      titleKoEl.textContent = '';
      titleKoEl.style.display = 'none';
    }

    typeEl.textContent = mapAlbumType(album.type);
    releaseEl.textContent = album.releaseDate
      ? `발매일 · ${formatDate(album.releaseDate)}`
      : '';

    if (Array.isArray(album.tags) && album.tags.length > 0) {
      tagsEl.innerHTML = album.tags
        .map(tag => `<span class="tag">#${escapeHtml(tag)}</span>`)
        .join('');
    } else {
      tagsEl.innerHTML = '';
    }

    descEl.textContent = album.description || '앨범 소개가 준비 중입니다.';

    const cover = album.coverUrl && album.coverUrl.trim() !== ''
      ? album.coverUrl
      : 'https://dummyimage.com/600x600/555/ffffff&text=No+Image';
    coverEl.src = cover;
    coverEl.alt = titleJa;
    coverEl.onerror = () => {
      coverEl.onerror = null;
      coverEl.src = 'https://dummyimage.com/600x600/555/ffffff&text=No+Image';
    };

    const tracks = Array.isArray(album.tracks) ? album.tracks : [];
    trackCountEl.textContent = tracks.length ? `${tracks.length}곡` : '';

    if (!tracks.length) {
      trackBodyEl.innerHTML = `<div class="album-grid-status">등록된 트랙이 없습니다.</div>`;
    } else {
      trackBodyEl.innerHTML = tracks
        .map(track => createTrackRow(track))
        .join('');
    }

    detailContainer.dataset.state = 'loaded';
    setStatus('');
  }

  function createTrackRow(track) {
    const trackNo = track.trackNo ?? '';
    const title = track.titleJa || '제목 미정';
    const duration = track.duration || '';
    const trackLink = track.id ? `song-detail.html?id=${track.id}` : '#';

    return `
      <div class="track">
        <span class="track-num">${escapeHtml(trackNo)}</span>
        <a class="track-title" href="${trackLink}">${escapeHtml(title)}</a>
        <span class="track-duration">${escapeHtml(duration)}</span>
      </div>
    `;
  }

  function setStatus(message, isError = false) {
    if (!statusEl) return;
    if (!message) {
      statusEl.textContent = '';
      statusEl.className = 'album-detail-status';
      return;
    }
    statusEl.textContent = message;
    statusEl.className = isError ? 'album-detail-status error' : 'album-detail-status';
  }
});

function mapAlbumType(type) {
  const mapping = {
    ALBUM: '정규 앨범',
    SINGLE: '싱글',
    EP: 'EP'
  };
  if (!type) return '앨범';
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
