document.addEventListener("DOMContentLoaded", () => {
  const statusElement = document.getElementById("searchStatus");
  const resultsElement = document.getElementById("searchResults");

  if (!statusElement || !resultsElement) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const keyword = params.get("q")?.trim();

  if (!keyword) {
    statusElement.textContent =
      "검색어가 비어 있어요. 상단 검색창에서 단어를 입력한 뒤 다시 시도해 주세요.";
    resultsElement.hidden = true;
    return;
  }

  statusElement.innerHTML = `<strong>"${keyword}"</strong> 검색 결과를 준비 중이에요.`;
  resultsElement.hidden = true;
});
