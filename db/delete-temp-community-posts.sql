-- Delete temporary-user posts from community (safe, scoped)
-- Adjust values as needed, then run with psql or a DB client.

BEGIN;

-- 1) Configure targets --------------------------------------------------------
-- Temporary numeric user IDs to remove (edit if needed)
-- Example: ARRAY[687227, 700001]
WITH _cfg AS (
  SELECT ARRAY[687227]::int[]     AS uids,
         'free'::text             AS board_slug
)
-- 2) Preview target posts ----------------------------------------------------
, target_posts AS (
  SELECT p.id, p.user_id, b.slug, p.title, p.created_at
  FROM community_posts p
  JOIN community_boards b ON b.id = p.board_id
  JOIN _cfg c ON TRUE
  WHERE p.user_id = ANY (c.uids)
    AND b.slug = c.board_slug
)
SELECT * FROM target_posts ORDER BY id;

-- 3) Delete children first to avoid FK errors --------------------------------
WITH _cfg AS (
  SELECT ARRAY[687227]::int[] AS uids,
         'free'::text         AS board_slug
), tp AS (
  SELECT p.id
  FROM community_posts p
  JOIN community_boards b ON b.id = p.board_id
  WHERE p.user_id = ANY ((SELECT uids FROM _cfg))
    AND b.slug = (SELECT board_slug FROM _cfg)
)
DELETE FROM post_likes         WHERE post_id IN (SELECT id FROM tp);

WITH _cfg AS (
  SELECT ARRAY[687227]::int[] AS uids,
         'free'::text         AS board_slug
), tp AS (
  SELECT p.id
  FROM community_posts p
  JOIN community_boards b ON b.id = p.board_id
  WHERE p.user_id = ANY ((SELECT uids FROM _cfg))
    AND b.slug = (SELECT board_slug FROM _cfg)
)
DELETE FROM community_comments  WHERE post_id IN (SELECT id FROM tp);

WITH _cfg AS (
  SELECT ARRAY[687227]::int[] AS uids,
         'free'::text         AS board_slug
), tp AS (
  SELECT p.id
  FROM community_posts p
  JOIN community_boards b ON b.id = p.board_id
  WHERE p.user_id = ANY ((SELECT uids FROM _cfg))
    AND b.slug = (SELECT board_slug FROM _cfg)
)
DELETE FROM community_post_media WHERE post_id IN (SELECT id FROM tp);

WITH _cfg AS (
  SELECT ARRAY[687227]::int[] AS uids,
         'free'::text         AS board_slug
), tp AS (
  SELECT p.id
  FROM community_posts p
  JOIN community_boards b ON b.id = p.board_id
  WHERE p.user_id = ANY ((SELECT uids FROM _cfg))
    AND b.slug = (SELECT board_slug FROM _cfg)
)
DELETE FROM community_post_tags  WHERE post_id IN (SELECT id FROM tp);

-- 4) Delete posts -------------------------------------------------------------
WITH _cfg AS (
  SELECT ARRAY[687227]::int[] AS uids,
         'free'::text         AS board_slug
)
DELETE FROM community_posts p
USING community_boards b, _cfg c
WHERE p.board_id = b.id
  AND p.user_id = ANY (c.uids)
  AND b.slug = c.board_slug;

COMMIT;

-- How to run (example):
--   psql "postgresql://USER:PASS@localhost:5432/DBNAME" -f db/delete-temp-community-posts.sql
-- Or open this file in a SQL client and execute.

