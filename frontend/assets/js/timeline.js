document.addEventListener("DOMContentLoaded", () => {
  const statusElement = document.getElementById("timelineStatus");
  const previewElement = document.getElementById("timelinePreview");

  if (!statusElement || !previewElement) {
    return;
  }

  const mockTimelineEntries = [
    {
      id: "2025-album-release",
      date: "2025.04.17",
      label: "ALBUM",
      title: "정규 4집 《Midnight Highway》 발매",
      description:
        "신규 타이틀곡과 라이브 인기곡 스튜디오 버전을 포함한 12트랙 구성을 발표했습니다.",
      note: "리드 싱글은 3월 말 선공개 예정",
    },
    {
      id: "2025-tour-announcement",
      date: "2025.05.01",
      label: "LIVE",
      title: "Aimyon Road Trip 2025 개최 발표",
      description:
        "전국 8개 도시를 순회하는 아레나 투어. 이번 시즌부터 밴드 셋 리스트가 전면 개편됩니다.",
    },
    {
      id: "2024-award",
      date: "2024.12.10",
      label: "AWARD",
      title: "Japan Record Awards 스페셜 스테이지 출연",
      description:
        "연말 시상식에서 ‘필요도 없는 말’ 어쿠스틱 버전을 라이브로 선보였습니다.",
    },
    {
      id: "2024-interview",
      date: "2024.11.02",
      label: "MEDIA",
      title: "Oricon News 단독 인터뷰 공개",
      description:
        "새 앨범 프로듀싱과 창작 과정에 대한 심층 인터뷰. 작업 비하인드와 협업 스토리를 공유했습니다.",
    },
  ];

  if (!mockTimelineEntries.length) {
    statusElement.textContent =
      "타임라인 데이터가 준비되는 대로 자동으로 채워 드릴게요.";
    previewElement.hidden = true;
    return;
  }

  statusElement.textContent =
    "샘플 일정 데이터를 바탕으로 연도별 타임라인 카드가 생성됐어요. API 연결 시 이 배열만 교체하면 됩니다.";
  previewElement.hidden = false;
  previewElement.innerHTML = buildTimelineMarkup(mockTimelineEntries);

  function buildTimelineMarkup(entries) {
    const sorted = [...entries].sort((a, b) =>
      a.date < b.date ? 1 : a.date > b.date ? -1 : 0
    );
    let currentYear = null;

    return sorted
      .map((entry) => {
        const entryYear = entry.date?.slice(0, 4) || "";
        const yearHeading =
          entryYear && entryYear !== currentYear
            ? `<h2 class="section-title">${entryYear}</h2>`
            : "";
        currentYear = entryYear || currentYear;
        return `${yearHeading}${createTimelineCard(entry)}`;
      })
      .join("");
  }

  function createTimelineCard(entry) {
    const badges = [entry.label, entry.date]
      .filter(Boolean)
      .map((text) => `<span class="meta-badge">${text}</span>`)
      .join("");

    return `
      <article class="story-card timeline-card" data-timeline-id="${entry.id}">
        <div class="post-header__meta">
          ${badges}
        </div>
        <h3>${entry.title}</h3>
        <p>${entry.description || ""}</p>
        ${entry.note ? `<p class="story-meta">${entry.note}</p>` : ""}
      </article>
    `;
  }
});
