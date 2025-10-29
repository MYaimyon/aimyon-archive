const PLACES_API_BASE = (() => {
  if (window.location.protocol === "file:") {
    return "http://localhost:8080/api/places";
  }
  const { protocol, hostname, port } = window.location;
  if (port && port !== "" && port !== "8080") {
    return `${protocol}//${hostname}:8080/api/places`;
  }
  return "/api/places";
})();

let map;
let infoWindow;
let markers = [];
const DEFAULT_CENTER = { lat: 35.6762, lng: 139.6503 }; // Tokyo 기준

document.addEventListener("DOMContentLoaded", () => {
  const listEl = document.getElementById("placesList");
  const mapEl = document.getElementById("placesMap");
  const formEl = document.getElementById("placeFilters");
  const cityInput = document.getElementById("filterCity");
  const tagInput = document.getElementById("filterTag");
  const keywordInput = document.getElementById("filterKeyword");

  if (!listEl) {
    return;
  }

  initMap(mapEl);

  const renderSkeleton = (count = 6) => {
    listEl.innerHTML = Array.from({ length: count })
      .map(
        () => `
          <div class="place-card skeleton">
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
            <div class="skeleton-line"></div>
          </div>
        `
      )
      .join("");
  };

  const renderPlaces = (places) => {
    if (!places.length) {
      listEl.innerHTML =
        '<div class="place-empty"><p>조건에 맞는 장소가 없어요.</p></div>';
      renderMarkers([]);
      return;
    }

    listEl.innerHTML = places
      .map((place) => {
        const name = escapeHtml(place.name || "이름 미정");
        const description = escapeHtml(place.description || "설명이 준비 중이에요.");
        const address = escapeHtml(place.address || "");
        const city = escapeHtml(place.city || "");
        const country = escapeHtml(place.country || "");
        const tips = escapeHtml(place.tips || "");
        const tags = Array.isArray(place.tags) ? place.tags : [];

        const metaParts = [];
        if (address) metaParts.push(address);
        if (city) metaParts.push(city);
        if (country) metaParts.push(country);

        const coords =
          place.latitude && place.longitude
            ? `<span>위치 ${place.latitude}, ${place.longitude}</span>`
            : "";

        const tipsHtml = tips
          ? `<div class="place-tips">TIP · ${tips}</div>`
          : "";

        return `
          <article class="place-card">
            <h3>${name}</h3>
            <div class="place-meta">
              ${metaParts.map((part) => `<span>${part}</span>`).join(' · ')}
              ${coords}
            </div>
            <p class="place-description">${description}</p>
            ${tipsHtml}
            ${
              tags.length
                ? `<div class="place-tags">${tags
                    .map((tag) => `<span class="place-tag">#${escapeHtml(tag)}</span>`)
                    .join("")}</div>`
                : ""
            }
          </article>
        `;
      })
      .join("");

    renderMarkers(places);
  };

  const fetchPlaces = async (params = {}) => {
    const url = new URL(PLACES_API_BASE, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });

    renderSkeleton();
    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      renderPlaces(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load places", err);
      listEl.innerHTML =
        '<div class="place-empty"><p>장소 정보를 불러오지 못했어요.</p></div>';
      renderMarkers([]);
    }
  };

  formEl?.addEventListener("submit", (event) => {
    event.preventDefault();
    fetchPlaces({
      city: cityInput.value.trim(),
      tag: tagInput.value.trim(),
      keyword: keywordInput.value.trim()
    });
  });

  fetchPlaces();
});

function initMap(container) {
  if (!container || typeof google === "undefined" || !google.maps) {
    return;
  }
  if (map) return;
  map = new google.maps.Map(container, {
    center: DEFAULT_CENTER,
    zoom: 6,
    mapTypeControl: false,
    fullscreenControl: false
  });
  infoWindow = new google.maps.InfoWindow();
}

function renderMarkers(places) {
  if (!map || typeof google === "undefined" || !google.maps) return;

  markers.forEach((marker) => marker.setMap(null));
  markers = [];

  const bounds = new google.maps.LatLngBounds();
  let hasMarker = false;

  places.forEach((place) => {
    if (!place.latitude || !place.longitude) return;
    const position = new google.maps.LatLng(place.latitude, place.longitude);
    const marker = new google.maps.Marker({
      position,
      map,
      title: place.name || ""
    });

    marker.addListener("click", () => {
      const content = `
        <div style="min-width:180px">
          <strong>${escapeHtml(place.name || "")}</strong><br>
          ${place.address ? `${escapeHtml(place.address)}<br>` : ""}
          ${place.city ? `${escapeHtml(place.city)} ` : ""}${place.country ? escapeHtml(place.country) : ""}
        </div>
      `;
      infoWindow?.setContent(content);
      infoWindow?.open(map, marker);
    });

    markers.push(marker);
    bounds.extend(position);
    hasMarker = true;
  });

  if (hasMarker) {
    if (markers.length === 1) {
      map.setCenter(bounds.getCenter());
      map.setZoom(14);
    } else {
      map.fitBounds(bounds, 60);
    }
  } else {
    map.setCenter(DEFAULT_CENTER);
    map.setZoom(6);
  }
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
