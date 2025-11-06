document.addEventListener("DOMContentLoaded", () => {
  const statusElement = document.getElementById("liveStatus");
  const previewElement = document.getElementById("livePreview");

  if (!statusElement || !previewElement) {
    return;
  }

  const mockLiveEvents = [
    {
      id: "2025-tour-spring",
      title: "Aimyon Hall Tour 2025 — Spring Bloom",
      category: "TOUR",
      status: "예매 예정",
      dateLabel: "2025.03.12 (수) 19:00",
      venue: "Tokyo Garden Theater",
      city: "도쿄, 일본",
      description:
        "봄 시즌을 여는 홀 투어. 신규 싱글 수록곡과 리마스터 무대를 함께 선보입니다.",
      highlight: true,
    },
    {
      id: "2024-winter-fes",
      title: "Winter Acoustic Special 2024",
      category: "FESTIVAL",
      status: "예매 중",
      dateLabel: "2024.12.21 (토) 17:30",
      venue: "Osaka-jo Hall",
      city: "오사카, 일본",
      description:
        "통기타 셋과 스트링 사운드로 재구성한 연말 콘서트. 게스트와 합동 무대 예정.",
    },
    {
      id: "2024-online",
      title: "Aimyon Streaming Live — Home Session",
      category: "ONLINE",
      status: "다시보기",
      dateLabel: "2024.10.05 (토) 20:00",
      venue: "Online Premiere",
      city: "YouTube / NicoNico Live",
      description:
        "미공개 곡 데모와 팬 사연을 소개한 온라인 스페셜. 다시보기 링크로 바로 감상 가능합니다.",
      replayUrl: "#",
    },
  ];

  if (!mockLiveEvents.length) {
    statusElement.textContent =
      "공연 데이터가 준비되는 대로 자동으로 안내해 드릴게요.";
    previewElement.hidden = true;
    return;
  }

  statusElement.textContent =
    "샘플 데이터를 불러와 미리보기 카드를 만들었어요. API 연동 시 이 블록을 교체하면 됩니다.";
  previewElement.hidden = false;
  previewElement.classList.add("places-list");
  previewElement.innerHTML = mockLiveEvents
    .map((event) => createLiveCard(event))
    .join("");

  function createLiveCard(event) {
    const statusBadge = event.status
      ? `<span class="meta-badge" data-type="status">${event.status}</span>`
      : "";
    const categoryLabel = event.category
      ? `<span class="meta-badge" data-type="category">${event.category}</span>`
      : "";
    const infoParts = [event.dateLabel, event.venue].filter(Boolean);
    const infoLine = infoParts.join(" · ");
    const cityLine = event.city ? ` · ${event.city}` : "";

    return `
      <article class="place-card live-card${
        event.highlight ? " place-card--highlight" : ""
      }" data-live-id="${event.id}">
        <div class="post-header__meta">
          ${categoryLabel}
          ${statusBadge}
        </div>
        <h3>${event.title}</h3>
        <p class="post-meta-row">
          <span>${infoLine}${cityLine}</span>
        </p>
        <p class="post-body">${event.description || ""}</p>
        ${
          event.replayUrl
            ? `<div class="card-actions"><a href="${event.replayUrl}" class="card-link">다시보기 열기</a></div>`
            : ""
        }
      </article>
    `;
  }
});
