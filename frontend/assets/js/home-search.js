document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("homeSearchForm");
  const input = document.getElementById("homeSearchInput");

  if (!form || !input) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const keyword = input.value.trim();
    if (!keyword) {
      input.focus();
      return;
    }

    const params = new URLSearchParams({ q: keyword });
    window.location.href = `search.html?${params.toString()}`;
  });
});
