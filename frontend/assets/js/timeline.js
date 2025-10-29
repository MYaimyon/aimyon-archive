document.addEventListener("DOMContentLoaded", () => {
  const statusElement = document.getElementById("timelineStatus");
  const previewElement = document.getElementById("timelinePreview");

  if (!statusElement || !previewElement) {
    return;
  }

  statusElement.textContent =
    "지금은 플레이스홀더 상태입니다. 타임라인 API를 준비하면서 실제 활동 데이터와 연동할게요.";
  previewElement.hidden = true;
});
