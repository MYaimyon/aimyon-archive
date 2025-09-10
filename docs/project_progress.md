# 📁 프로젝트 진행 상황

## 🚀 완료된 작업
- [x] 디스코그래피 페이지 기본 UI 구현
  - 앨범 그리드 레이아웃
  - 앨범 필터링 기능 (전체/정규 앨범/싱글/EP)
  - 반응형 디자인 적용

## 🔜 다음에 구현할 작업
### 1. 앨범 상세 페이지 (`album-detail.html`)
- [ ] 앨범 커버 및 기본 정보 표시
- [ ] 수록곡 목록 테이블
- [ ] 전체 재생 기능
- [ ] 곡 클릭 시 `song-detail.html`로 이동

### 2. 필요한 API 엔드포인트
```
GET /api/albums/{id} - 앨범 상세 정보 조회
```

## 📌 앨범 상세 페이지 구조 (예시)
```html
<!-- 앨범 헤더 -->
<div class="album-header">
    <img src="앨범커버" alt="앨범명">
    <div class="album-info">
        <h1>앨범명</h1>
        <p>발매일: 2023.01.01</p>
        <p>앨범 유형: 정규 4집</p>
    </div>
</div>

<!-- 수록곡 목록 -->
<div class="tracklist">
    <div class="track">
        <span class="track-num">1</span>
        <a href="song-detail.html?id=1" class="track-title">곡 제목</a>
        <span class="track-duration">3:45</span>
    </div>
</div>
```

## 💡 추가 고려사항
- 앨범별 상세 설명 추가
- 관련 앨범 추천 기능
- 재생 목록 연동 (선택 사항)

## 📂 참고 자료
- [디스코그래피 페이지 코드](/frontend/pages/discography.html)
- [페이지 스타일](/frontend/assets/css/pages.css)

---
마지막 업데이트: 2025-09-09
