# UI ↔ 데이터 매칭표 (Aimyon Archive)

| 페이지 | 주요 목적 | 필요 데이터/엔드포인트 | 핵심 컴포넌트/블록 | 비고 |
|--------|----------|----------------------|-------------------|------|
| `index.html` | 입문자 랜딩, 주요 섹션 바로가기 | - 최신 뉴스 요약: `GET /api/news-events?size=3`<br>- 인기 커뮤니티 글(선택): `GET /api/community/posts`<br>- 검색 진입(쿼리 없음) | 히어로 배너, 퀵 링크 카드, 검색 폼, 최신 소식 리스트 | 전체 리뉴얼 시 메인 카드 토큰 통일 필요 |
| `search.html` | 통합 검색 결과 브라우징 | `GET /api/search?q=...&targets=albums,tracks,places,items,liveEvents` | 검색 폼(고정), 도메인별 결과 섹션, “결과 없음” 안내 | 향후 상세 페이지 링크 연결 |
| `discography.html` | 앨범 목록 브라우징 | `GET /api/albums` | 필터(연도, 타입), 카드 그리드, 페이지네이션 | 기존 fetch 유지, UI 토큰 정리 |
| `album-detail.html` | 앨범 상세 및 트랙 소개 | `GET /api/albums/{id}` | 앨범 헤더, 트랙 리스트, 관련 스토리/미디어 링크 | 트랙 클릭 → `song-detail` 연동 |
| `song-list.html` | 곡 전체 목록 | `GET /api/tracks?page=...` | 검색/필터, 리스트 테이블, 링크 버튼 | 태그/앨범 필터 확장 고려 |
| `song-detail.html` | 곡 상세 + 스토리 | `GET /api/tracks/{id}` | 곡 메타, MV/라이브 탭, 스토리 탭, 관련 곡 섹션 | 스토리 카테고리 탭 스타일 통일 |
| `news.html` | 뉴스/이벤트 목록 | `GET /api/news-events?type=...` | 필터 탭, 카드 리스트, 스켈레톤 로딩 | 태그/연도 필터 확장 여지 |
| `news-detail.html` | 뉴스 본문 | `GET /api/news-events/{id}` | 헤더(타이틀/날짜), 본문, 태그, 관련 링크 | 공유 버튼/열람 수 등 추후 추가 |
| `places.html` | 묭지순례 맵 + 리스트 | `GET /api/places?...` | 필터 폼, 지도(Google Maps), 카드 리스트, 상세 모달(옵션) | 지도/리스트 동기화 계획 필요 |
| `community.html` | 게시판 리스트 | `GET /api/community/posts?board=...` | 보드 탭, 게시글 카드, 글쓰기 CTA | 로그인/권한 UI 준비 |
| `community-post.html` | 게시글 상세 | `GET /api/community/posts/{id}`<br>`GET /api/community/posts/{id}/comments` | 본문, 댓글 리스트, 좋아요/댓글 작성 폼 | 인증 후 상태 따라 버튼 처리 |
| `timeline.html` | 활동 연대표 | `GET /api/timeline-events?year=&type=` | 연도/타입 필터, 타임라인 카드(세로), 연표 구분선 | 스크롤 애니메이션/그룹 헤더 계획 |
| `live.html` | 콘서트/세트리스트 | `GET /api/live-events?tour=&year=`<br>`GET /api/live-events/{id}` | 리스트 카드, 상세 모달/아코디언, 세트리스트 테이블 | 모바일 세트리스트 UI 별도 설계 |
| `items.html` | 착용/추천 아이템 | `GET /api/items?category=&tag=`<br>`GET /api/item-categories` | 카테고리 필터, 카드 그리드, 상세 모달, 태그 약칭 | 이미지 레이아웃 규격화 |
| `profile.html` | 아티스트 소개 | (초기 정적) → 향후 `docs` 파싱 또는 `GET /api/profile` (추가 예정) | 히어로, 핵심 통계, 소개 카드, 링크 버튼 | 백엔드 연동 시 구조 재정의 |
| `admin` (추후) | 데이터 관리 백오피스 | - 앨범/곡 관리: `POST/PUT/DELETE /api/albums`, `.../tracks`<br>- 타임라인/라이브/아이템 CRUD | 테이블, 폼, 업로드 컴포넌트, 권한 토글 | 로그인·권한 체크(ADMIN) 필요 |

## 추가 메모
- **공통 컴포넌트 후보**: 카드(기본/이미지), 태그/필터 칩, 섹션 헤더, 버튼, 알림/상태 메시지, 페이지네이션.
- **데이터 연동 시 확인할 것**: 응답 필드명 → 프런트 사용 키 매핑, 날짜/시간 포맷, null 처리, 에러/로딩 상태.
- **모바일 대응**: 각 페이지마다 breakpoint별(768px/1024px 등) 레이아웃 계획을 리뉴얼 작업 전에 문서화.

