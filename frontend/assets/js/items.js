document.addEventListener("DOMContentLoaded", () => {
  const statusElement = document.getElementById("itemsStatus");
  const previewElement = document.getElementById("itemsPreview");

  if (!statusElement || !previewElement) {
    return;
  }

  statusElement.textContent =
    "추천 아이템 데이터를 정리하면서 이미지 업로드, 카테고리 필터 기능도 함께 준비 중이에요.";
  previewElement.hidden = true;
});
