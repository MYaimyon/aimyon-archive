# System Design Notes (Aimyon Archive)

이 문서는 앞으로 구현할 핵심 기능(음악 스토리, 묭지순례, 라이브/타임라인, 커뮤니티/관리자, 검색)에 대한 데이터 구조와 API 초안을 정리하기 위한 메모다. 개발을 진행하면서 언제든 자유롭게 수정/추가할 수 있다.

## 1. 음악 도메인 확장 – 제작 배경 / 비하인드 스토리

곡 상세 페이지에서 곡별 제작 배경이나 인터뷰를 보여주기 위한 테이블과 API 초안.

### 1.1 테이블 설계 (`track_story`)
| 컬럼 | 타입(예시) | 설명 |
|------|-----------|------|
| `id` | BIGSERIAL PK | 스토리 고유 ID |
| `track_id` | BIGINT FK | 어떤 트랙에 속한 스토리인지 (필수) |
| `content` | TEXT | 제작 배경/비하인드 본문 |
| `category` | VARCHAR(50) | 스토리 유형 (예: INTERVIEW, RECORDING, LIVE) |
| `source_name` | VARCHAR(255) | 출처 이름 (매체/프로그램명 등) |
| `source_url` | VARCHAR(1024) | 출처 URL |
| `language` | VARCHAR(8) | 언어 코드 (ko, ja 등) |
| `created_at` | TIMESTAMP | 등록 시각 |
| `updated_at` | TIMESTAMP | 수정 시각 |

> 참고: `album_id`는 `track_id`를 통해 조인하면 알 수 있으므로 별도 컬럼은 선택 사항.

### 1.2 API 초안
- `GET /api/tracks/{id}` 응답에 `stories` 배열 포함
- 필요 시 `GET /api/tracks/{id}/stories` 로 분리 가능
- 스토리 응답 예시
  ```json
  {
    "id": 15,
    "category": "INTERVIEW",
    "content": "밤행 버스를 타고 상경하던 경험에서 탄생한 곡입니다.",
    "source_name": "OTOTOY",
    "source_url": "https://ototoy.jp/...",
    "language": "ja",
    "created_at": "2017-09-20T12:00:00",
    "updated_at": "2017-09-20T12:00:00"
  }
  ```

## 2. 묭지순례 (Places)

아이묭의 흔적이 남아 있는 장소를 지도/리스트로 제공하기 위한 설계. 팬들이 여행 코스를 짤 수 있도록 충분한 정보를 담는다.

### 2.1 장소 테이블 (`place`)
| 컬럼 | 타입(예시) | 설명 |
|------|-----------|------|
| `id` | BIGSERIAL PK | 장소 고유 ID |
| `name` | VARCHAR(255) | 장소명 (카페, 공연장 등) |
| `description` | TEXT | 간단한 장소 소개 |
| `address` | VARCHAR(255) | 주소 전체 |
| `city` | VARCHAR(120) | 도시 |
| `country` | VARCHAR(120) | 국가 |
| `latitude` | DECIMAL(10,7) | 위도 |
| `longitude` | DECIMAL(10,7) | 경도 |
| `tags` | TEXT (JSON 배열) | 장소 유형 태그 (카페, 촬영지 등) |
| `tips` | TEXT | 방문 팁/추천 포인트 |
| `created_at` / `updated_at` | TIMESTAMP | 등록, 수정 시각 |

### 2.2 장소 이미지/인증샷 (`place_media`)
| 컬럼 | 설명 |
|------|------|
| `id` | 이미지/영상 고유 ID |
| `place_id` | 어떤 장소에 속하는지 |
| `media_url` | 이미지/영상 URL |
| `submitted_by` | 업로드한 사람(닉네임 또는 user_id) |
| `description` | 한 줄 코멘트 (선택) |
| `created_at` | 업로드 시각 |

### 2.4 API 초안
- `GET /api/places` – 기본 목록. 필터: `?city=`, `?tag=`, `?keyword=`
- `GET /api/places/{id}` – 상세 정보 + 사진/팁 + 관련 곡 등
- `GET /api/places/nearby?lat=&lng=&radius=` – 주변 장소 추천(지도 확대/축소 대응)
- `POST /api/places` – 관리자용 등록/수정
- `POST /api/places/{id}/media` – 인증샷 업로드(선택)

### 2.5 UI 가이드
- 지도 중심 뷰: 일본 지도를 기본으로 마커를 배치하고 호버 시 짧은 설명, 클릭 시 상세 페이지로 이동.
- 리스트 뷰: 도시·태그 필터와 최신순 정렬을 제공해 직관적으로 비교 탐색.
- 장소 상세: 관리자 입력 정보(소개, 사진, 팁)만 노출하고 하단에 커뮤니티 묭지순례 인증 썸네일(3~4개)과 `커뮤니티에서 더 보기` 링크를 제공.


## 4. 공지사항 (News & Events)

앨범/싱글 소식과 팬 이벤트 일정을 하나의 공지 스트림으로 관리한다.

### 4.1 테이블 설계 (`news_event`)
| 컬럼 | 타입(예시) | 설명 |
|------|-----------|------|
| `id` | BIGSERIAL PK | 공지/이벤트 식별자 |
| `title` | VARCHAR(255) | 제목 |
| `summary` | TEXT | 카드에 표시할 요약 문구 |
| `content` | TEXT | 상세 본문 (선택) |
| `type` | VARCHAR(20) | `NEWS`, `EVENT` 등 분류 코드 |
| `event_date` | DATE | 이벤트 날짜 (`type=EVENT`일 때 사용) |
| `location` | VARCHAR(255) | 이벤트 장소 (`type=EVENT`일 때 사용) |
| `tags` | TEXT (JSON) | 필터·검색용 태그 배열 |
| `created_at` / `updated_at` | TIMESTAMP | 생성, 수정 시각 |

### 4.2 API 초안
- `GET /api/news-events` : 전체 목록, 쿼리 파라미터 `?type=news`, `?type=event`, `?year=` 제공.
- `GET /api/news-events/{id}` : 단건 상세. 필요 시 본문·링크·이미지 반환.
- `POST /api/news-events`, `PUT /api/news-events/{id}`, `DELETE /api/news-events/{id}` : 관리자 CRUD.

### 4.3 UI 가이드
- 상단 탭: `전체`, `뉴스`, `이벤트` 탭을 제공해 한 번 클릭으로 필터링.
- 리스트 카드: 카드 상단에 유형 배지(NEWS/EVENT)를 노출하고 일정·장소는 우측에 정렬.
- 이벤트 상세: 이벤트 유형은 장소·시간을 강조하고 지도·외부 신청 링크 버튼을 함께 배치.

## 5. Community / Admin

Community MVP keeps just two boards so things stay easy for newcomers:
1) Pilgrimage Proof (묭지순례 인증)
2) Free Talk (자유게시판)

Both boards share the same post/comment model but we track which board each post belongs to via a reference table instead of a free-form category column.

### 5.1 Tables
- `community_board`: `id`, `slug` (`pilgrimage`, `free`), `name`, `description`, `created_at`
- `community_post`: `id`, `board_id`, `user_id`, `title`, `content`, `media_urls` (JSON array, optional), `tags` (optional), `like_count`, `comment_count`, `created_at`, `updated_at`
- `community_comment`: `id`, `post_id`, `user_id`, `parent_id` (nullable for plain replies), `content`, `created_at`
- `post_like`: `id`, `post_id`, `user_id`, `created_at` (enforce `UNIQUE(post_id, user_id)` so 한 사람이 여러 번 좋아요 불가)

> 즐겨찾기(Bookmark)는 후순위—필요해지면 `post_bookmark` 테이블을 같은 패턴으로 추가.

### 5.2 API Draft
- `GET /api/community/posts?board=pilgrimage&sort=latest&page=&size=`
- `GET /api/community/posts/{id}` – 단건 + 댓글 (혹은 `/comments` 별도)
- `POST /api/community/posts` – body에 `board_id` 또는 `board_slug`, `title`, `content`, `media_urls`
- `PUT /api/community/posts/{id}` – 작성자 본인 또는 관리자만 수정 가능
- `DELETE /api/community/posts/{id}` – 작성자 본인 또는 관리자가 삭제 (사용자 삭제 허용)
- `GET /api/community/posts/{id}/comments`
- `POST /api/community/posts/{id}/comments`
- `DELETE /api/community/comments/{commentId}` – 작성자/관리자 권한 체크
- `POST /api/community/posts/{id}/like` / `DELETE /api/community/posts/{id}/like`
- 관리자 도구: `/api/admin/community/posts` 로 전체 조회/숨김 처리, `/api/admin/community/reports` (추가 시)

### 5.3 Auth & Permissions
- 로그인 사용자만 글/댓글 작성, 수정, 삭제, 좋아요 가능
- 비로그인 사용자는 목록·상세·댓글 읽기만 가능
- JWT 토큰에 `user_id`, `role` 포함 (`USER`, `ADMIN`)
- 작성자 본인 검증: 토큰의 `user_id`와 글/댓글의 `user_id` 비교
- 관리자(`ADMIN`)는 모든 글/댓글 숨김/삭제 가능, 신고 처리 시 활용

### 5.4 UI Notes
- 상단 탭 두 개: `묭지순례 인증` / `자유게시판`. 탭 전환 시 `board` 파라미터를 변경하여 목록 API 호출.
- 리스트 카드는 텍스트 중심: 제목, 작성자, 작성일, 좋아요·댓글 수만 노출 (썸네일 없이 간결하게).
- 상세 보기에서는 내용을 넉넉히 보여주고 좋아요/댓글 인터랙션을 배치. 필요하면 첨부 URL을 본문 하단에 링크로만 표시.
- 글 작성 폼: `board` 선택은 탭 상태에 따라 자동 지정. 입력 필드는 제목/내용/선택적 링크 배열 정도로 단순 유지.
- 관리자 전용 기능은 별도 화면 없이 글/댓글 카드에 `숨김` 또는 `삭제` 버튼이 보이도록 해도 MVP에 충분.

### 5.5 Later Enhancements
- 신고 기능 (`community_report`) 으로 스팸/부적절 글 관리
- 이미지 업로드(S3 등) 연결
- 태그 검색 또는 Full-Text Search
- 활동 알림, 즐겨찾기, 대댓글(쓰레드) 등은 추후 단계
## 6. 검색

앨범/곡/장소/라이브 등 주요 도메인 데이터를 한 번에 찾아볼 수 있는 통합 검색.

### 6.1 범위
- 기본: Album, Track, Place, LiveEvent
- 확장: CommunityPost, Story 등(추후 필요 시)

### 6.2 API 초안
- `GET /api/search?q=keyword&target=tracks`
  - `target` 파라미터로 검색 대상을 한정
  - 기본 응답
    ```json
    {
      "albums": [...],
      "tracks": [...],
      "places": [...],
      "liveEvents": [...]
    }
    ```

---
추가 설계가 필요하면 해당 섹션을 계속 보강해 나간다.
