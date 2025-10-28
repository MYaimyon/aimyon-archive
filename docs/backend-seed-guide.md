# Backend Seed Guide

애플리케이션을 로컬에서 테스트할 때 최소한으로 필요한 데이터만 빠르게 채워 넣을 수 있도록 정리한 가이드입니다. 모든 예시는 `application-local.yml`에 설정된 DB(`aim_archive`, 사용자 `aim`/`1234`)를 기준으로 작성되었습니다.

## 1. 접속

```bash
psql -h localhost -U aim -d aim_archive
```

## 2. 커뮤니티 게시판

```sql
INSERT INTO community_boards (slug, name, description, created_at)
VALUES
  ('pilgrimage', '묭지순례 인증', '팬들이 직접 다녀온 묭지 장소 인증', now()),
  ('free', '자유게시판', '자유롭게 이야기 나누는 공간', now());
```

## 3. 커뮤니티 게시글 / 댓글 / 좋아요

```sql
-- 게시글
INSERT INTO community_posts (
  board_id, user_id, title, content,
  like_count, comment_count, created_at, updated_at
)
VALUES (1, 100, '첫 번째 묭지 인증', '오사카 묭지 다녀왔어요!', 0, 0, now(), now())
RETURNING id;

-- 미디어 / 태그 (위 INSERT의 반환 id 사용)
INSERT INTO community_post_media (post_id, media_url) VALUES (1, 'https://example.com/photo.jpg');
INSERT INTO community_post_tags (post_id, tag) VALUES (1, 'osaka');

-- 댓글
INSERT INTO community_comments (post_id, user_id, content, created_at)
VALUES (1, 101, '사진 너무 예뻐요!', now());

-- 좋아요
INSERT INTO post_likes (post_id, user_id, created_at)
VALUES (1, 102, now());
```

## 4. 뉴스 / 이벤트

```sql
INSERT INTO news_events (
  title, summary, content, type,
  event_date, location, created_at, updated_at
)
VALUES (
  '새 싱글 티저 공개 예정',
  '다음 싱글 티저 이미지 공개',
  '티저, 비하인드, 팬 이벤트 안내 등 자세한 내용',
  'NEWS',
  '2025-11-01',
  null,
  now(),
  now()
)
RETURNING id;

-- 태그
INSERT INTO news_event_tags (news_event_id, tag) VALUES (1, '싱글'), (1, '티저');
```

## 5. 묭지순례 장소

```sql
INSERT INTO places (
  name, description, address, city, country,
  latitude, longitude, tips, created_at, updated_at
)
VALUES (
  '아카네 커피',
  '아이묭이 자주 언급한 카페',
  '오사카시 나니와구 1-2-3',
  '오사카',
  '일본',
  34.669722, 135.501111,
  '주문 직전에 잔여 재고 확인 필수',
  now(),
  now()
)
RETURNING id;

INSERT INTO place_tags (place_id, tag) VALUES (1, 'cafe'), (1, 'osaka');
```

## 6. 트랙 스토리

```sql
INSERT INTO track_stories (
  track_id, category, content, source_name, source_url,
  language, created_at, updated_at
)
VALUES (
  1,
  'INTERVIEW',
  '녹음 당시 프로듀서와의 에피소드',
  'Rolling Stone Japan',
  'https://example.com/interview',
  'ja',
  now(),
  now()
);
```

## 7. 확인용 엔드포인트

- `GET /api/community/boards`
- `GET /api/community/posts?board=pilgrimage`
- `GET /api/community/posts/{id}/comments`
- `GET /api/news-events`
- `GET /api/places`
- `GET /api/tracks/{trackId}/stories`

위 엔드포인트를 호출하면 데이터가 잘 들어갔는지 바로 확인할 수 있습니다.
