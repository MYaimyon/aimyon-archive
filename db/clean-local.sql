-- Clean all tables (data only) for local profile
-- Keeps schema intact, resets identity sequences

BEGIN;

TRUNCATE TABLE
  public.post_likes,
  public.community_comments,
  public.community_post_media,
  public.community_post_tags,
  public.community_posts,
  public.community_boards,
  public.track_stories,
  public.tracks,
  public.album_tags,
  public.albums,
  public.news_event_tags,
  public.news_events,
  public.place_tags,
  public.places
RESTART IDENTITY CASCADE;

COMMIT;

