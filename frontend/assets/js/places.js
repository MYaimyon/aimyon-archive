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

let mapInstance;
let infoWindow;
let renderedMarkers = [];
const DEFAULT_CENTER = { lat: 35.6762, lng: 139.6503 }; // Tokyo 기준
const PLACE_PAGE_SIZE = 6;

document.addEventListener("DOMContentLoaded", () => {
  const listEl = document.getElementById("placesList");
  const mapEl = document.getElementById("placesMap");
  const formEl = document.getElementById("placeFilters");
  const cityInput = document.getElementById("filterCity");
  const tagInput = document.getElementById("filterTag");
  const keywordInput = document.getElementById("filterKeyword");
  const prevBtn = document.getElementById("placesPrev");
  const nextBtn = document.getElementById("placesNext");
  const pageStatusEl = document.getElementById("placesPageStatus");

  if (!listEl) {
    return;
  }

  initMap(mapEl);

  let currentPage = 0;
  let totalPages = 0;
  let lastFilters = {
    city: "",
    tag: "",
    keyword: ""
  };
  let markerDataCache = [];
  let pendingScrollId = null;
  let isLoading = false;

  const renderSkeleton = (count = PLACE_PAGE_SIZE) => {
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

  const updatePagination = (pageData) => {
    totalPages = pageData.totalPages ?? 0;
    const page = pageData.page ?? 0;

    if (pageStatusEl) {
      pageStatusEl.textContent =
        totalPages > 0 ? `${page + 1} / ${totalPages}` : "0 / 0";
    }

    if (prevBtn) {
      prevBtn.disabled = page <= 0 || totalPages === 0 || isLoading;
    }
    if (nextBtn) {
      nextBtn.disabled =
        totalPages === 0 || page >= totalPages - 1 || isLoading;
    }
  };

  const scrollToPlaceCard = (placeId) => {
    if (!placeId) {
      return;
    }
    const card = listEl.querySelector(`[data-place-id="${placeId}"]`);
    if (!card) {
      return;
    }
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.classList.add("place-card--highlight");
    setTimeout(() => {
      card.classList.remove("place-card--highlight");
    }, 1500);
    pendingScrollId = null;
  };

  const renderPlaces = (places) => {
    if (!places.length) {
      listEl.innerHTML =
        '<div class="place-empty"><p>조건에 맞는 장소가 없어요.</p></div>';
      renderMarkersOnMap([]);
      return;
    }

    listEl.innerHTML = places
      .map((place) => {
        const name = escapeHtml(place.name || "이름 미정");
        const description = escapeHtml(
          place.description || "설명이 준비 중이에요."
        );
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
          <article class="place-card" data-place-id="${place.id}">
            <h3>${name}</h3>
            <div class="place-meta">
              ${metaParts.map((part) => `<span>${part}</span>`).join(" · ")}
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

    if (pendingScrollId) {
      requestAnimationFrame(() => scrollToPlaceCard(pendingScrollId));
    }
  };

  const handleMarkerClick = (markerInfo) => {
    if (!markerInfo || markerInfo.id == null) {
      return;
    }
    const order = markerInfo.order ?? 0;
    const targetPage = Math.floor(order / PLACE_PAGE_SIZE);
    pendingScrollId = markerInfo.id;

    if (targetPage !== currentPage) {
      currentPage = targetPage;
      fetchPlaces();
    } else {
      scrollToPlaceCard(markerInfo.id);
    }
  };

  const renderMarkersOnMap = (markerData = []) => {
    if (!mapInstance || typeof google === "undefined" || !google.maps) {
      return;
    }

    renderedMarkers.forEach((marker) => marker.setMap(null));
    renderedMarkers = [];

    if (!markerData.length) {
      mapInstance.setCenter(DEFAULT_CENTER);
      mapInstance.setZoom(6);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    markerData.forEach((markerInfo) => {
      if (
        !markerInfo ||
        markerInfo.latitude == null ||
        markerInfo.longitude == null
      ) {
        return;
      }
      const position = new google.maps.LatLng(
        Number(markerInfo.latitude),
        Number(markerInfo.longitude)
      );
      const marker = new google.maps.Marker({
        position,
        map: mapInstance,
        title: markerInfo.name || ""
      });

      marker.addListener("click", () => {
        if (infoWindow) {
          infoWindow.setContent(
            `<strong>${escapeHtml(markerInfo.name || "")}</strong>`
          );
          infoWindow.open({
            anchor: marker,
            map: mapInstance,
            shouldFocus: false
          });
        }
        handleMarkerClick(markerInfo);
      });

      renderedMarkers.push(marker);
      bounds.extend(position);
    });

    if (renderedMarkers.length === 1) {
      mapInstance.setCenter(bounds.getCenter());
      mapInstance.setZoom(14);
    } else if (!bounds.isEmpty()) {
      mapInstance.fitBounds(bounds, 60);
    }
  };

  const buildRequestParams = () => ({
    ...lastFilters,
    page: currentPage,
    size: PLACE_PAGE_SIZE
  });

  const fetchPlaces = async () => {
    if (isLoading) {
      return;
    }

    isLoading = true;
    updatePagination({ page: currentPage, totalPages });
    renderSkeleton();

    try {
      const url = new URL(PLACES_API_BASE, window.location.origin);
      Object.entries(buildRequestParams()).forEach(([key, value]) => {
        if (value !== undefined && value !== null && `${value}`.trim() !== "") {
          url.searchParams.set(key, value);
        }
      });

      const response = await fetch(url.toString(), {
        headers: { Accept: "application/json" }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        markerDataCache = data.map((place, index) => ({
          id: place.id,
          name: place.name,
          latitude: place.latitude,
          longitude: place.longitude,
          order: index
        }));
        totalPages =
          data.length > 0 ? Math.ceil(data.length / PLACE_PAGE_SIZE) : 0;
        const start = currentPage * PLACE_PAGE_SIZE;
        const end = start + PLACE_PAGE_SIZE;
        renderPlaces(data.slice(start, end));
        renderMarkersOnMap(markerDataCache);
        updatePagination({ page: currentPage, totalPages });
        return;
      }

      const {
        content = [],
        markers: markersPayload = [],
        totalPages: tp = 0,
        page = 0
      } = data;

      markerDataCache = Array.isArray(markersPayload) ? markersPayload : [];

      if (content.length === 0 && tp > 0 && page >= tp) {
        currentPage = tp - 1;
        await fetchPlaces();
        return;
      }

      renderPlaces(content);
      renderMarkersOnMap(markerDataCache);
      updatePagination({ page, totalPages: tp });
    } catch (error) {
      console.error("Failed to load places", error);
      listEl.innerHTML =
        '<div class="place-empty"><p>장소 정보를 불러오지 못했어요.</p></div>';
      markerDataCache = [];
      renderMarkersOnMap(markerDataCache);
      updatePagination({ page: 0, totalPages: 0 });
    } finally {
      isLoading = false;
      updatePagination({ page: currentPage, totalPages });
    }
  };

  formEl?.addEventListener("submit", (event) => {
    event.preventDefault();
    currentPage = 0;
    lastFilters = {
      city: cityInput?.value.trim() ?? "",
      tag: tagInput?.value.trim() ?? "",
      keyword: keywordInput?.value.trim() ?? ""
    };
    fetchPlaces();
  });

  prevBtn?.addEventListener("click", () => {
    if (currentPage <= 0 || isLoading) return;
    currentPage -= 1;
    fetchPlaces();
  });

  nextBtn?.addEventListener("click", () => {
    if (isLoading || totalPages === 0 || currentPage >= totalPages - 1) return;
    currentPage += 1;
    fetchPlaces();
  });

  fetchPlaces();
});

function initMap(container) {
  if (!container || typeof google === "undefined" || !google.maps) {
    return;
  }
  if (mapInstance) return;
  mapInstance = new google.maps.Map(container, {
    center: DEFAULT_CENTER,
    zoom: 6,
    mapTypeControl: false,
    fullscreenControl: false
  });
  infoWindow = new google.maps.InfoWindow();
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
