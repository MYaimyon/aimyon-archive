# System Design Notes (Aimyon Archive)

이 문서는 주요 기능 영역(음악 스토리, 묭지순례, 라이브/타임라인, 커뮤니티/관리자, 검색)에 대한 데이터 구조와 API 초안을 정리하기 위해 사용한다. 이후 기능을 구현하면서 수시로 업데이트해도 된다.

## 1. 음악 도메인 확장 – 제작 배경 / 비하인드 스토리

곡 상세 페이지에서 제작 배경, 인터뷰, 비하인드 스토리를 제공하기 위한 스키마와 API 초안이다.

### 1.1 테이블 설계 (`track_story`)
| 컬럼 | 타입(예시) | 설명 |
|------|-----------|------|
| `id` | BIGSERIAL PK | 스토리 고유 ID |
| `track_id` | BIGINT FK | 어떤 트랙에 속한 이야기인지 (필수) |
| `content` | TEXT | 제작 배경/비하인드 본문 |
| `category` | VARCHAR(50) | 스토리 유형 (INTERVIEW, RECORDING, LIVE 등) |
| `source_name` | VARCHAR(255) | 출처 이름 (매체/프로그램명 등) |
| `source_url` | VARCHAR(1024) | 출처 URL |
| `language` | VARCHAR(8) | 언어 코드 (예: ko, ja) |
| `created_at` | TIMESTAMP | 스토리 등록 시각 |
| `updated_at` | TIMESTAMP | 스토리 수정 시각 |

> 참고: `album_id`는 `track_id`를 통해 조인하면 알 수 있으므로 별도 보관은 선택 사항이다.

### 1.2 API 초안
- `GET /api/tracks/{id}` 응답에 `stories` 배열을 포함
- (선택) `GET /api/tracks/{id}/stories` 로 분리해도 됨
- 스토리 응답 예시:
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

## 2. 묭지순례 (Places) – 설계 예정
- 장소 정보: 이름, 설명, 주소, 좌표(lat/lng), 방문 팁 등
- 인증샷/사진을 위한 `place_media` 테이블 (place_id, media_url, submitted_by, created_at)
- 지도 연동 API 초안: `GET /api/places`, `GET /api/places/{id}` (추가로 `?near=` 필터 고려)
- **추후 상세 설계 필요**

## 3. 라이브 / 타임라인 – 설계 예정
- 공연/활동 타임라인 기록 (공연명, 날짜, 장소, 세트리스트 등)
- `live_event`, `live_setlist` 구조 고려
- API 예시: `GET /api/live-events`, `GET /api/live-events/{id}`, `GET /api/live-events?year=2023`
- **추후 상세 설계 필요**

## 4. 커뮤니티 / 관리자 – 설계 예정
- 게시글, 댓글, 좋아요/즐겨찾기, 이미지 업로드 정책 정리
- 관리자 CRUD / 권한(Role) 설계, JWT 인증 플로우 고려
- API 예시: `GET/POST /api/community/posts`, `POST /api/community/posts/{id}/comments`
- **추후 상세 설계 필요**

## 5. 검색 – 설계 예정
- 대상: 앨범, 곡, 장소, 라이브 (묭아이템은 후순위)
- API 예시: `GET /api/search?q=마리골드&target=tracks`
- 응답 구조: 각 도메인별 결과 블록을 포함한 통합 검색
- **추후 상세 설계 필요**

---
추가 아이디어가 생기면 해당 섹션 아래에 내용을 보완하거나 새로운 섹션을 자유롭게 추가하면 된다.
