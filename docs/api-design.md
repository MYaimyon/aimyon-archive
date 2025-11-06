# Aimyon Archive API ?ㅺ퀎 (珥덉븞)

## 怨듯넻 ?ы빆
- Base URL: /api
- ?묐떟 ?뺤떇: pplication/json
- ?몄쬆: MVP 珥덇린?먮뒗 鍮꾨줈洹몄씤 湲곕컲, 愿由ъ옄/而ㅻ??덊떚 沅뚰븳? 異뷀썑 JWT ?꾩엯 ?덉젙
- ?섏씠吏?湲곕낯: page, size (湲곕낯媛?page=0, size=20)
- ?뺣젹 湲곕낯: sort 荑쇰━ ?뚮씪誘명꽣 ?ъ슜 (?? sort=releaseDate,desc)

---

## 1. ?⑤쾾 (Albums)
### 1.1 GET /api/albums
紐⑸줉 議고쉶. ?꾪꽣? 寃?됱쓣 ?④퍡 ?쒓났.

#### ?붿껌 ?뚮씪誘명꽣
| ?대쫫 | ???| ?덉떆 | ?ㅻ챸 |
|------|------|------|------|
| page | int | 0 | ?섏씠吏 踰덊샇 (0遺???쒖옉) |
| size | int | 20 | ?섏씠吏 ?ш린 |
| sort | string | 
eleaseDate,desc | ?뺣젹 湲곗? (?띿꽦,諛⑺뼢) |
| 	ype | string | ALBUM | ALBUM, SINGLE, EP ???⑤쾾 ?좏삎 ?꾪꽣 |
| year | int | 2018 | 諛쒕ℓ ?곕룄 ?꾪꽣 |
| keyword | string | ?욁꺁?쇈궡?쇈꺂??| ?쒕ぉ/?ㅻ챸 寃???ㅼ썙??|

#### ?묐떟 ?덉떆
`json
{
  "content": [
    {
      "id": 1,
      "titleJa": "?믤삦??궓??궢?ㅳ깉?▲꺍??,
      "titleKo": "泥?텣???묒궗?댄듃癒쇳듃",
      "type": "ALBUM",
      "releaseDate": "2017-09-13",
      "coverUrl": "https://...",
      "tags": ["J-POP", "?ы겕"]
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 12,
  "totalPages": 1
}
`

### 1.2 GET /api/albums/{albumId}
?뱀젙 ?⑤쾾 ?곸꽭. ?몃옓, ?ㅽ넗由? 愿??誘몃뵒?대? ?ы븿.

#### ?묐떟 ?덉떆
`json
{
  "id": 1,
  "titleJa": "?믤삦??궓??궢?ㅳ깉?▲꺍??,
  "titleKo": "泥?텣???묒궗?댄듃癒쇳듃",
  "type": "ALBUM",
  "releaseDate": "2017-09-13",
  "description": "?곕퇃 ?뺢퇋 1吏?..",
  "coverUrl": "https://...",
  "tracks": [
    {
      "id": 101,
      "titleJa": "?쎼굮鴉앫걟?잆걚?졼겏??,
      "titleKo": "?щ옉???꾪븯怨??띕떎嫄곕굹",
      "trackNo": 1,
      "duration": "03:58",
      "lyricsSummary": "?щ옉??????붿쭅??怨좊갚",
      "storyId": 201
    }
  ],
  "stories": [
    {
      "id": 201,
      "trackId": 101,
      "category": "INTERVIEW",
      "content": "?명꽣酉??붿빟...",
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

## 2. ?몃옓 (Tracks)
### 2.1 GET /api/tracks/{trackId}
怨??곸꽭 ?뺣낫.

#### ?묐떟 ?덉떆
`json
{
  "id": 101,
  "albumId": 1,
  "titleJa": "鸚쒑죱?먦궧",
  "titleKo": "?쇳뻾 踰꾩뒪",
  "trackNo": 2,
  "duration": "03:45",
  "lyricsSummary": "諛ㅽ뻾 踰꾩뒪瑜??怨?..",
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
    { "id": 102, "titleJa": "?욁꺁?쇈궡?쇈꺂??, "titleKo": "留덈━怨⑤뱶" }
  ]
}
`

### 2.2 GET /api/tracks
媛꾨떒 紐⑸줉/寃??(?좏깮). ?먮룞?꾩꽦?대굹 寃?됱슜?쇰줈 ?ъ슜.

| ?뚮씪誘명꽣 | ?ㅻ챸 |
|----------|-------|
| keyword | ?쒕ぉ 寃??|
| lbumId | ?뱀젙 ?⑤쾾 ?뚯냽 怨〓쭔 |
| page, size | ?섏씠吏?|

?묐떟: content 諛곗뿴??id, 	itleJa, 	itleKo, lbumId ?뺣룄???붿빟 ?뺣낫 ?쒓났.

---

---

## 3. Community

### 3.1 GET /api/community/boards
게시판 목록. 프런트에서는 slug 기반으로 탭을 구성한다.

```json
[
  { "slug": "free", "name": "자유게시판", "description": "잡담, 후기" },
  { "slug": "pilgrimage", "name": "묭지순례 인증", "description": "성지 인증샷 공유" }
]
```

### 3.2 GET /api/community/posts
게시글 목록. `board` 파라미터 필수.

| 파라미터 | 설명 |
|----------|------|
| board | 게시판 slug |
| keyword | 제목/본문 검색 |
| page, size | 페이지네이션 |
| sort | `createdAt,desc` 기본 |

```json
{
  "content": [
    {
      "id": "mock-post-1001",
      "board": "free",
      "title": "처음 Aimyon을 알게 된 순간",
      "category": "잡담",
      "author": "미도리",
      "createdAt": "2024-10-20T10:15:00+09:00",
      "viewCount": 128,
      "likeCount": 12,
      "commentCount": 4,
      "notice": false
    }
  ],
  "page": 0,
  "size": 15,
  "totalElements": 32,
  "totalPages": 3
}
```

### 3.3 GET /api/community/posts/{id}
게시글 상세와 메타 정보를 반환.

```json
{
  "id": "mock-post-1001",
  "board": "free",
  "title": "처음 Aimyon을 알게 된 순간",
  "author": "미도리",
  "authorId": 102938,
  "createdAt": "2024-10-20T10:15:00+09:00",
  "updatedAt": "2024-10-20T11:00:00+09:00",
  "viewCount": 128,
  "likeCount": 12,
  "commentCount": 4,
  "content": "<p>처음 들었던 Marigold가...</p>",
  "tags": ["잡담"],
  "shareUrl": "https://aimyon-archive.com/community/post/1001",
  "isNotice": false,
  "isLiked": false
}
```

### 3.4 POST /api/community/posts/{id}/like
좋아요 토글. `userId` 쿼리 파라미터 필요. 응답으로 최신 게시글 DTO를 반환한다.

### 3.5 GET /api/community/posts/{id}/comments
댓글 목록.

```json
[
  {
    "id": "c-1",
    "userId": 102938,
    "author": "aimyon팬",
    "content": "저도 오사카 공연 다녀왔어요!",
    "createdAt": "2024-10-20T11:12:00+09:00",
    "isOwner": true
  }
]
```

### 3.6 POST /api/community/posts/{id}/comments
본문:

```json
{
  "userId": 102938,
  "content": "댓글 내용"
}
```

성공 시 201 + 새 댓글 DTO. 삭제는 `DELETE /api/community/comments/{commentId}?userId=` 형태.

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
    { "order": 1, "trackId": 3, "title": "?쎼굮鴉앫걟?잆걚?졼겏??, "section": "MAIN" },
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
  "category": { "code": "FASHION", "name": "?⑥뀡" },
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
    { "id": 1, "title": "?믤삦??궓??궢?ㅳ깉?▲꺍??, "releaseDate": "2017-09-13" }
  ],
  "tracks": [
    { "id": 3, "title": "?쎼굮鴉앫걟?잆걚?졼겏??, "albumId": 1 }
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

## ?ㅼ쓬 ?묒뾽 硫붾え
- DTO/?뷀떚???ㅺ퀎 ?????꾨뱶??留욎떠 ?대옒???묒꽦 (?? AlbumResponse)
- Page<T> ?뺥깭 ?묐떟???꾪븳 怨듯넻 ?섑띁(response wrapper) ?꾩엯 怨좊젮
- API 臾몄꽌???꾧뎄(OpenAPI/Swagger) ?ㅼ젙: Springdoc-openapi ?ъ슜 ?덉젙

臾몄꽌 ?낅뜲?댄듃 ??踰꾩쟾 湲곕줉???④꺼 二쇱꽭??
