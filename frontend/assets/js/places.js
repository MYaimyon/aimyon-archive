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

document.addEventListener("DOMContentLoaded", () => {
  const listEl = document.getElementById("placesList");
  const formEl = document.getElementById("placeFilters");
  const cityInput = document.getElementById("filterCity");
  const tagInput = document.getElementById("filterTag");
  const keywordInput = document.getElementById("filterKeyword");

  if (!listEl) {
    return;
  }

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

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
