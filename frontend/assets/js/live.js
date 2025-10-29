document.addEventListener("DOMContentLoaded", () => {
  const statusElement = document.getElementById("liveStatus");
  const previewElement = document.getElementById("livePreview");

  if (!statusElement || !previewElement) {
    return;
  }

  statusElement.textContent =
    "세트리스트와 공연 정보를 수집하는 중이에요. 준비가 끝나면 자동으로 목록을 보여줄게요.";
  previewElement.hidden = true;
});
