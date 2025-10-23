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

### 2.3 (선택) 방문 로그 / 리뷰
- `place_visit_log`: `user_id`, `place_id`, `visited_at`, `memo`
- `place_review`: `rating`(별점), `comment`
> MVP에서는 생략 가능. 나중에 커뮤니티와 묶고 싶을 때 참고.

### 2.4 API 초안
- `GET /api/places` – 기본 목록. 필터: `?city=`, `?tag=`, `?keyword=`
- `GET /api/places/{id}` – 상세 정보 + 사진/팁 + 관련 곡 등
- `GET /api/places/nearby?lat=&lng=&radius=` – 주변 장소 추천(지도 확대/축소 대응)
- `POST /api/places` – 관리자용 등록/수정
- `POST /api/places/{id}/media` – 인증샷 업로드(선택)

### 2.5 UI 아이디어
- **지도 중심 보기**: 일본 지도에 마커 표시, 마우스오버 시 요약, 클릭 시 상세 페이지 이동
- **리스트 보기**: 도시/태그별 필터, 정렬(인기순, 최신순 등)
- 모바일: 지도/리스트 탭 전환, 현재 위치 기반 근처 장소 추천

## 3. 라이브 / 타임라인

공연/활동을 시간순으로 아카이브하기 위한 기본 구상. 추후 확장 시 이 구조를 바탕으로 구체화한다.

### 3.1 테이블 아이디어
- `live_event`: `id`, `title`, `event_date`, `venue`, `city`, `country`, `description`
- `live_setlist`: `id`, `live_event_id`, `track_id`, `order`
- (선택) `live_media`: 공연 사진/포스터 등

### 3.2 API 초안
- `GET /api/live-events` (필터: `?year=`, `?city=`)
- `GET /api/live-events/{id}` (세트리스트 포함)
- `POST /api/live-events`/`PUT` (관리자용)

## 4. 커뮤니티 / 관리자

팬 게시판, 댓글, 좋아요/즐겨찾기, 관리자 권한을 다룰 기본 틀.

### 4.1 테이블 아이디어
- `users`: `id`, `email`, `password_hash`, `display_name`, `role`, `created_at`
- `community_post`: `id`, `user_id`, `category`, `title`, `content`, `media_urls`, `likes_count`, `created_at`, `updated_at`
- `community_comment`: `id`, `post_id`, `user_id`, `parent_id`, `content`, `created_at`
- (선택) `post_favorite`, `post_like`

### 4.2 API 초안
- `GET/POST /api/community/posts`
- `GET /api/community/posts/{id}`
- `POST /api/community/posts/{id}/comments`
- `POST /api/community/posts/{id}/like`, `POST /api/community/posts/{id}/favorite`
- 관리자용 `/api/admin/**` CRUD 및 이미지 업로드 관리

### 4.3 인증/권한 기본 방향
- JWT 기반 로그인/회원가입(`POST /api/auth/login`, `POST /api/auth/register`)
- Role: `ADMIN`, `USER`
- 관리자 전용 엔드포인트는 Role 체크 필수

## 5. 검색

앨범/곡/장소/라이브 등 주요 데이터를 한 번에 검색할 수 있는 구조.

### 5.1 대상
- 기본: Album, Track, Place, LiveEvent
- 확장: CommunityPost, Story 등 (필요 시)

### 5.2 API 초안
- `GET /api/search?q=keyword&target=tracks`
  - `target` 생략 시 통합 검색
  - 응답 예시
    ```json
    {
      "albums": [...],
      "tracks": [...],
      "places": [...],
      "liveEvents": [...]
    }
    ```

---
향후 기능 구현을 시작할 때 이 문서를 기반으로 세부 스키마와 API를 구체화하면 된다. 추가 아이디어가 생기면 바로 이 문서에 기록하자.


