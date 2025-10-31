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

## 4. Timeline (Artist Activity)

### 4.1 GET /api/timeline-events
List timeline events sorted by `eventDate` desc (default) with optional filters.

#### Query Parameters
| Name | Type | Default | Notes |
|------|------|---------|-------|
| page | int | 0 | Page index |
| size | int | 20 | Page size |
| year | int | - | Filter by year (`eventDate` year) |
| type | string | - | `RELEASE`, `MEDIA`, `AWARD`, `LIVE`, `OTHER` |
| keyword | string | - | Searches title & summary (ILIKE) |

#### Response
```json
{
  "content": [
    {
      "id": 101,
      "title": "First Budokan Concert",
      "summary": "AIMYON''s first headline show at Budokan.",
      "eventDate": "2024-05-12",
      "eventType": "LIVE",
      "coverImageUrl": "https://...",
      "relatedAlbumId": 12,
      "relatedTrackId": null
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 45,
  "totalPages": 3
}
```

### 4.2 GET /api/timeline-events/{id}
Returns full detail including related ids and external links.

```json
{
  "id": 101,
  "title": "First Budokan Concert",
  "summary": "AIMYON''s first headline show at Budokan.",
  "eventDate": "2024-05-12",
  "eventType": "LIVE",
  "externalUrl": "https://example.com/article",
  "coverImageUrl": "https://...",
  "relatedAlbumId": 12,
  "relatedTrackId": null,
  "relatedLiveEventId": 88
}
```

### 4.3 Admin (future)
- POST /api/timeline-events (ADMIN)
- PUT /api/timeline-events/{id} (ADMIN)
- DELETE /api/timeline-events/{id} (ADMIN)

---

## 5. Live Events

### 5.1 GET /api/live-events
List concerts/festivals with basic info. Setlist is excluded to keep payload small.

#### Query Parameters
| Name | Type | Default | Notes |
|------|------|---------|-------|
| page | int | 0 | Page index |
| size | int | 20 | Page size |
| year | int | - | Filter by event year |
| tour | string | - | Exact match on `tourName` |
| city | string | - | City keyword (ILIKE) |
| upcoming | boolean | false | When true, return only future dates |

#### Response
```json
{
  "content": [
    {
      "id": 88,
      "title": "AIMYON TOUR 2025 - Love Letters",
      "eventDate": "2025-03-18",
      "city": "Tokyo",
      "country": "JP",
      "venue": "Nippon Budokan",
      "tourName": "Love Letters",
      "isFestival": false
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 12,
  "totalPages": 1
}
```

### 5.2 GET /api/live-events/{id}
Returns concert detail including setlist in order.

```json
{
  "id": 88,
  "title": "AIMYON TOUR 2025 - Love Letters",
  "eventDate": "2025-03-18",
  "venue": "Nippon Budokan",
  "city": "Tokyo",
  "country": "JP",
  "tourName": "Love Letters",
  "notes": "Encore featured acoustic version of ""Marigold"".",
  "posterImageUrl": "https://...",
  "setlist": [
    { "order": 1, "trackId": 3, "title": "愛を伝えたいだとか", "section": "MAIN" },
    { "order": 2, "title": "Marigold (Acoustic)", "section": "MAIN" },
    { "order": 15, "trackId": 21, "section": "ENCORE" }
  ]
}
```

### 5.3 Admin (future)
- POST /api/live-events (ADMIN)
- PUT /api/live-events/{id} (ADMIN)
- POST /api/live-events/{id}/setlist (ADMIN) - bulk replace setlist items
- DELETE /api/live-events/{id} (ADMIN)

---

## 6. Items

### 6.1 GET /api/items
Returns fan-facing catalogue of items AIMYON wore or recommended.

#### Query Parameters
| Name | Type | Default | Notes |
|------|------|---------|-------|
| page | int | 0 | Page index |
| size | int | 20 | Page size |
| category | string | - | `FASHION`, `BOOK`, `ACCESSORY`, ... |
| tag | string | - | Filter by tag (exact match) |
| keyword | string | - | Searches title & description |

#### Response
```json
{
  "content": [
    {
      "id": 501,
      "title": "Vintage Denim Jacket",
      "categoryCode": "FASHION",
      "description": "Worn during 2023 TV appearance",
      "sourceType": "MEDIA",
      "sourceDetail": "Music Station",
      "tags": ["casual", "tv"]
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 30,
  "totalPages": 2
}
```

### 6.2 GET /api/items/{id}
Detailed view with media assets.

```json
{
  "id": 501,
  "title": "Vintage Denim Jacket",
  "category": { "code": "FASHION", "name": "패션" },
  "description": "Worn during 2023 TV appearance",
  "sourceType": "MEDIA",
  "sourceDetail": "Music Station",
  "sourceUrl": "https://...",
  "priceNote": "Sold out",
  "tags": ["casual", "tv"],
  "media": [
    { "url": "https://.../jacket.jpg", "altText": "On-stage photo" }
  ]
}
```

### 6.3 Reference Endpoints
- GET /api/item-categories - return code/name list for filters.
- Admin CRUD mirror timeline/live (POST/PUT/DELETE protected by ADMIN).

---

## 7. Search

### 7.1 GET /api/search
Aggregated search across supported domains.

#### Query Parameters
| Name | Type | Default | Notes |
|------|------|---------|-------|
| q | string | (required) | Keyword |
| targets | string | all | Comma list (`albums,tracks,places,items,liveEvents`) |
| size | int | 5 | Per-domain result size (cap) |

#### Response
```json
{
  "albums": [
    { "id": 1, "title": "青春のエキサイトメント", "releaseDate": "2017-09-13" }
  ],
  "tracks": [
    { "id": 3, "title": "愛を伝えたいだとか", "albumId": 1 }
  ],
  "places": [
    { "id": 11, "name": "Osaka pilgrimage cafe" }
  ],
  "items": [
    { "id": 501, "title": "Vintage Denim Jacket" }
  ],
  "liveEvents": [
    { "id": 88, "title": "AIMYON TOUR 2025 - Love Letters", "eventDate": "2025-03-18" }
  ]
}
```

### 7.2 Notes
- Limit each domain to `size` results to keep payload manageable.
- For MVP perform sequential queries; later we can parallelise or use a search index.
- Include `total` counts per domain once we add materialized view/full-text search.

------

## 다음 작업 메모
- DTO/엔티티 설계 시 위 필드에 맞춰 클래스 작성 (예: AlbumResponse)
- Page<T> 형태 응답을 위한 공통 래퍼(response wrapper) 도입 고려
- API 문서화 도구(OpenAPI/Swagger) 설정: Springdoc-openapi 사용 예정

문서 업데이트 시 버전 기록을 남겨 주세요.
