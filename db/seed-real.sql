-- Seed real data for local profile
-- Fill and run via psql: \i db/seed-real.sql
-- Tip: Keep BEGIN/COMMIT to apply atomically.

BEGIN;

-- 1) News / Events ---------------------------------------------------------
-- Example (uncomment and edit to use):
-- INSERT INTO news_events (
--   title, summary, content, type, event_date, location, created_at, updated_at
-- ) VALUES (
--   '제목', '요약', '본문', 'NEWS', '2025-11-01', 'Tokyo', now(), now()
-- ) RETURNING id;
-- INSERT INTO news_event_tags (news_event_id, tag) VALUES (/* 위 반환 id */ 1, 'tag1');


-- 2) Community boards ------------------------------------------------------
-- Keep slugs to integrate with current frontend tabs (free, pilgrimage)
INSERT INTO community_boards (slug, name, description, created_at)
VALUES
  ('free', '자유게시판', '자유롭게 소통하는 공간', now()),
  ('pilgrimage', '묭지순례 인증', '직접 방문한 Aimyon 관련 장소 인증', now())
ON CONFLICT (slug) DO NOTHING;

-- 3) Community posts / media / comments -----------------------------------
-- Example (uncomment and edit):
-- WITH b AS (SELECT id FROM community_boards WHERE slug='pilgrimage')
-- INSERT INTO community_posts (
--   board_id, user_id, title, content, like_count, comment_count, created_at, updated_at
-- )
-- SELECT b.id, 1001, '게시글 제목', '내용 본문', 0, 0, now(), now() FROM b
-- RETURNING id;
-- INSERT INTO community_post_media (post_id, media_url) VALUES (/* 위 반환 id */ 1, 'https://example.com/photo.jpg');
-- INSERT INTO community_comments (post_id, user_id, content, created_at) VALUES (1, 2002, '댓글 내용', now());


-- 4) Places (묭지순례) -----------------------------------------------------
-- Example (uncomment and edit):
-- INSERT INTO places (
--   name, description, address, city, country, latitude, longitude, tips, created_at, updated_at
-- ) VALUES (
--   '장소 이름', '설명 텍스트', '주소', 'Osaka', 'Japan', 34.669722, 135.501111, '팁', now(), now()
-- ) RETURNING id;
-- INSERT INTO place_tags (place_id, tag) VALUES (/* place id */ 1, 'cafe');


-- 5) Albums / Tracks -------------------------------------------------------
-- Example: album + tags
-- WITH alb AS (
--   INSERT INTO albums (title_ja, title_ko, album_type, release_date, description, cover_url)
--   VALUES ('瞬間的シックスセンス','순간적인 식스 센스','ALBUM','2019-02-13','설명','https://...')
--   RETURNING id
-- )
-- INSERT INTO album_tags (album_id, tag)
-- SELECT id, t.tag FROM alb CROSS JOIN (VALUES ('Aimyon'),('Band')) AS t(tag);

-- Example: tracks under that album
-- WITH alb AS (SELECT id FROM albums WHERE title_ja='瞬間的シックスセンス' ORDER BY id DESC LIMIT 1)
-- INSERT INTO tracks (album_id, title_ja, title_ko, track_no, duration, lyrics_summary, mv_url)
-- SELECT alb.id, 'マリーゴールド','Marigold',1,'4:56','요약','https://www.youtube.com/...'
-- FROM alb;


COMMIT;

-- Optional quick checks (run manually):
-- SELECT count(*) FROM news_events;
-- SELECT count(*) FROM community_posts;
-- SELECT count(*) FROM places;
-- SELECT count(*) FROM albums; SELECT count(*) FROM tracks;

