# Aimyon Archive API 설계 (초안)

## 공통 사항
- Base URL: /api
- 응답 형식: pplication/json
- 인증: MVP 초기에는 비로그인 기반, 관리자/커뮤니티 권한은 추후 JWT 도입 예정
- 페이징 기본: page, size (기본값 page=0, size=20)
- 정렬 기본: sort 쿼리 파라미터 사용 (예: sort=releaseDate,desc)

---

## 1. 앨범 (Albums)
### 1.1 GET /api/albums
목록 조회. 필터와 검색을 함께 제공.

#### 요청 파라미터
| 이름 | 타입 | 예시 | 설명 |
|------|------|------|------|
| page | int | 0 | 페이지 번호 (0부터 시작) |
| size | int | 20 | 페이지 크기 |
| sort | string | eleaseDate,desc | 정렬 기준 (속성,방향) |
| 	ype | string | ALBUM | ALBUM, SINGLE, EP 등 앨범 유형 필터 |
| year | int | 2018 | 발매 연도 필터 |
| keyword | string | マリーゴールド | 제목/설명 검색 키워드 |

#### 응답 예시
`json
{
  "content": [
    {
      "id": 1,
      "titleJa": "青春のエキサイトメント",
      "titleKo": "청춘의 엑사이트먼트",
      "type": "ALBUM",
      "releaseDate": "2017-09-13",
      "coverUrl": "https://...",
      "tags": ["J-POP", "포크"]
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 12,
  "totalPages": 1
}
`

### 1.2 GET /api/albums/{albumId}
특정 앨범 상세. 트랙, 스토리, 관련 미디어를 포함.

#### 응답 예시
`json
{
  "id": 1,
  "titleJa": "青春のエキサイトメント",
  "titleKo": "청춘의 엑사이트먼트",
  "type": "ALBUM",
  "releaseDate": "2017-09-13",
  "description": "데뷔 정규 1집...",
  "coverUrl": "https://...",
  "tracks": [
    {
      "id": 101,
      "titleJa": "愛を伝えたいだとか",
      "titleKo": "사랑을 전하고 싶다거나",
      "trackNo": 1,
      "duration": "03:58",
      "lyricsSummary": "사랑에 대한 솔직한 고백",
      "storyId": 201
    }
  ],
  "stories": [
    {
      "id": 201,
      "trackId": 101,
      "category": "INTERVIEW",
      "content": "인터뷰 요약...",
      "source": "Magazine",
      "publishedAt": "2017-10-01"
    }
  ],
  "relatedMedia": {
    "interviews": [...],
    "liveVideos": [...]
  }
}
`

---

## 2. 트랙 (Tracks)
### 2.1 GET /api/tracks/{trackId}
곡 상세 정보.

#### 응답 예시
`json
{
  "id": 101,
  "albumId": 1,
  "titleJa": "夜行バス",
  "titleKo": "야행 버스",
  "trackNo": 2,
  "duration": "03:45",
  "lyricsSummary": "밤행 버스를 타고...",
  "mvUrl": "https://youtube.com/...",
  "stories": [
    {
      "id": 301,
      "category": "INTERVIEW",
      "content": "...",
      "source": "OTOTOY",
      "publishedAt": "2015-05-22"
    }
  ],
  "relatedTracks": [
    { "id": 102, "titleJa": "マリーゴールド", "titleKo": "마리골드" }
  ]
}
`

### 2.2 GET /api/tracks
간단 목록/검색 (선택). 자동완성이나 검색용으로 사용.

| 파라미터 | 설명 |
|----------|-------|
| keyword | 제목 검색 |
| lbumId | 특정 앨범 소속 곡만 |
| page, size | 페이징 |

응답: content 배열에 id, 	itleJa, 	itleKo, lbumId 정도의 요약 정보 제공.

---

## 3. 커뮤니티/관리자 관련 (미리보기)
- /api/community/posts (GET/POST)
- /api/community/posts/{id}/comments (GET/POST)
- /api/admin/albums (POST/PUT/DELETE)

세부 구조는 MVP 후반에 별도로 정리 예정.

---

## 다음 작업 메모
- DTO/엔티티 설계 시 위 필드에 맞춰 클래스 작성 (예: AlbumResponse)
- Page<T> 형태 응답을 위한 공통 래퍼(response wrapper) 도입 고려
- API 문서화 도구(OpenAPI/Swagger) 설정: Springdoc-openapi 사용 예정

문서 업데이트 시 버전 기록을 남겨 주세요.
