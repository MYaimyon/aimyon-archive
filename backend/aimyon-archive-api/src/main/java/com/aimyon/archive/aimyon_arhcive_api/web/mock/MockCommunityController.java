package com.aimyon.archive.aimyon_arhcive_api.web.mock;

import com.aimyon.archive.aimyon_arhcive_api.dto.PagedResponse;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@Profile("mock")
@RequestMapping("/api/community")
public class MockCommunityController {

    private final Map<String, Board> boardsBySlug = new ConcurrentHashMap<>();
    private final Map<Long, Post> postsById = new ConcurrentHashMap<>();
    private final Map<Long, List<Comment>> commentsByPostId = new ConcurrentHashMap<>();
    private final AtomicLong commentSequence = new AtomicLong(1L);

    public MockCommunityController() {
        Board free = new Board(1L, "free", "Free Board", "Casual talk and reviews");
        Board pilgrimage = new Board(2L, "pilgrimage", "Pilgrimage Log", "Share your Aimyon spots");
        boardsBySlug.put(free.slug(), free);
        boardsBySlug.put(pilgrimage.slug(), pilgrimage);

        registerPost(new Post(
                1001L,
                free,
                102938L,
                "미도리",
                "How I first discovered Aimyon",
                "Heard Marigold back in middle school and have been hooked ever since. Recent tour setlists felt even richer!",
                List.of(),
                List.of("Talk"),
                false,
                LocalDateTime.of(2024, 10, 20, 10, 15)
        ));

        registerPost(new Post(
                1002L,
                free,
                220011L,
                "라이브덕후",
                "Osaka concert photo dump",
                "Visited the Osaka show on 10/18! Sharing the setlist and a few shots.",
                List.of("https://example.com/osaka-photo.jpg"),
                List.of("Review"),
                false,
                LocalDateTime.of(2024, 10, 18, 21, 42)
        ));

        registerPost(new Post(
                2101L,
                pilgrimage,
                302244L,
                "묭맘",
                "Shizuoka Aimyon mural check-in",
                "Stopped by the Aimyon mural near Shizuoka station. Sharing the map link!",
                List.of("https://example.com/wall-mural.jpg"),
                List.of("Pilgrimage"),
                true,
                LocalDateTime.of(2024, 10, 16, 14, 40)
        ));

        commentsByPostId.put(1001L, new CopyOnWriteArrayList<>(List.of(
                new Comment(commentSequence.getAndIncrement(), 1001L, 881122L, "CatSinger", null, "I fell in love after hearing Ai o Tsutaetai Datoka!", LocalDateTime.of(2024, 10, 20, 11, 12)),
                new Comment(commentSequence.getAndIncrement(), 1001L, 990001L, "TokyoFan", null, "Thanks for sharing the latest tour setlist :)", LocalDateTime.of(2024, 10, 20, 11, 45))
        )));

        commentsByPostId.put(1002L, new CopyOnWriteArrayList<>(List.of(
                new Comment(commentSequence.getAndIncrement(), 1002L, 441122L, "LiveLogger", null, "Marigold as the opener was perfect!", LocalDateTime.of(2024, 10, 19, 8, 20))
        )));

        commentsByPostId.put(2101L, new CopyOnWriteArrayList<>(List.of(
                new Comment(commentSequence.getAndIncrement(), 2101L, 100777L, "Pilgrim", null, "Thanks for the map! Any nearby parking?", LocalDateTime.of(2024, 10, 16, 16, 20))
        )));
    }

    @GetMapping("/boards")
    public List<CommunityBoardResponse> getBoards() {
        return boardsBySlug.values().stream()
                .sorted(Comparator.comparing(Board::id))
                .map(board -> new CommunityBoardResponse(board.id(), board.slug(), board.name(), board.description()))
                .toList();
    }

    @GetMapping("/posts")
    public PagedResponse<CommunityPostListItem> getPosts(@RequestParam(name = "board") String boardSlug,
                                                         @RequestParam(name = "page", defaultValue = "0") int page,
                                                         @RequestParam(name = "size", defaultValue = "15") int size) {
        Board board = boardsBySlug.get(boardSlug);
        if (board == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Board not found");
        }

        List<Post> boardPosts = postsById.values().stream()
                .filter(post -> post.board().slug().equals(boardSlug))
                .sorted(Comparator.comparing(Post::createdAt).reversed())
                .toList();

        int fromIndex = Math.min(page * size, boardPosts.size());
        int toIndex = Math.min(fromIndex + size, boardPosts.size());
        List<CommunityPostListItem> content = boardPosts.subList(fromIndex, toIndex).stream()
                .map(this::toListItem)
                .toList();

        int totalPages = (int) Math.ceil(boardPosts.size() / (double) size);
        return new PagedResponse<>(content, page, size, boardPosts.size(), Math.max(totalPages, 1));
    }

    @GetMapping("/posts/{postId}")
    public CommunityPostDetail getPost(@PathVariable Long postId) {
        Post post = postsById.get(postId);
        if (post == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        }
        post.incrementView();
        return toDetail(post, false);
    }

    @GetMapping("/posts/{postId}/comments")
    public List<CommunityCommentDetail> getComments(@PathVariable Long postId) {
        ensurePostExists(postId);
        return commentsByPostId.getOrDefault(postId, List.of()).stream()
                .sorted(Comparator.comparing(Comment::createdAt))
                .map(comment -> new CommunityCommentDetail(
                        comment.id(),
                        comment.postId(),
                        comment.userId(),
                        comment.author(),
                        comment.parentId(),
                        comment.content(),
                        comment.createdAt(),
                        false
                ))
                .toList();
    }

    @PostMapping("/posts/{postId}/like")
    public CommunityPostDetail likePost(@PathVariable Long postId, @RequestParam(name = "userId", required = false) Long userId) {
        Post post = postsById.get(postId);
        if (post == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        }
        post.incrementLike();
        return toDetail(post, true);
    }

    @DeleteMapping("/posts/{postId}/like")
    public CommunityPostDetail unlikePost(@PathVariable Long postId, @RequestParam(name = "userId", required = false) Long userId) {
        Post post = postsById.get(postId);
        if (post == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        }
        post.decrementLike();
        return toDetail(post, false);
    }

    @PostMapping("/posts/{postId}/comments")
    public CommunityCommentDetail createComment(@PathVariable Long postId,
                                                @RequestBody CommentCreateRequest request) {
        ensurePostExists(postId);
        if (request == null || request.userId() == null || !StringUtils.hasText(request.content())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId and content are required");
        }

        Comment comment = new Comment(
                commentSequence.getAndIncrement(),
                postId,
                request.userId(),
                "회원 #" + request.userId(),
                request.parentId(),
                request.content(),
                LocalDateTime.now()
        );

        commentsByPostId.computeIfAbsent(postId, key -> new CopyOnWriteArrayList<>()).add(comment);
        return new CommunityCommentDetail(
                comment.id(),
                comment.postId(),
                comment.userId(),
                comment.author(),
                comment.parentId(),
                comment.content(),
                comment.createdAt(),
                true
        );
    }

    @DeleteMapping("/comments/{commentId}")
    public void deleteComment(@PathVariable Long commentId, @RequestParam(name = "userId", required = false) Long userId) {
        boolean removed = commentsByPostId.values().stream()
                .anyMatch(list -> list.removeIf(comment -> Objects.equals(comment.id(), commentId)));
        if (!removed) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found");
        }
    }

    private void ensurePostExists(Long postId) {
        if (!postsById.containsKey(postId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        }
    }

    private CommunityPostListItem toListItem(Post post) {
        long commentCount = commentsByPostId.getOrDefault(post.id(), List.of()).size();
        return new CommunityPostListItem(
                post.id(),
                post.board().slug(),
                post.board().name(),
                post.title(),
                post.category(),
                post.author(),
                post.userId(),
                post.viewCount(),
                post.likeCount(),
                commentCount,
                post.notice(),
                post.createdAt()
        );
    }

    private CommunityPostDetail toDetail(Post post, boolean liked) {
        long commentCount = commentsByPostId.getOrDefault(post.id(), List.of()).size();
        return new CommunityPostDetail(
                post.id(),
                post.board().id(),
                post.board().slug(),
                post.board().name(),
                post.userId(),
                post.author(),
                post.title(),
                post.content(),
                post.mediaUrls(),
                post.tags(),
                post.viewCount(),
                post.likeCount(),
                commentCount,
                post.notice(),
                liked,
                post.createdAt(),
                post.updatedAt()
        );
    }

    private void registerPost(Post post) {
        postsById.put(post.id(), post);
    }

    private record Board(Long id, String slug, String name, String description) {}

    private static class Post {
        private final long id;
        private final Board board;
        private final long userId;
        private final String author;
        private final String title;
        private final String content;
        private final List<String> mediaUrls;
        private final List<String> tags;
        private final boolean notice;
        private final LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private final AtomicLong viewCount = new AtomicLong();
        private final AtomicLong likeCount = new AtomicLong();

        Post(long id,
             Board board,
             long userId,
             String author,
             String title,
             String content,
             List<String> mediaUrls,
             List<String> tags,
             boolean notice,
             LocalDateTime createdAt) {
            this.id = id;
            this.board = board;
            this.userId = userId;
            this.author = author;
            this.title = title;
            this.content = content;
            this.mediaUrls = new ArrayList<>(mediaUrls);
            this.tags = new ArrayList<>(tags);
            this.notice = notice;
            this.createdAt = createdAt;
            this.updatedAt = createdAt;
        }

        long id() { return id; }
        Board board() { return board; }
        long userId() { return userId; }
        String author() { return author; }
        String title() { return title; }
        String content() { return content; }
        List<String> mediaUrls() { return Collections.unmodifiableList(mediaUrls); }
        List<String> tags() { return Collections.unmodifiableList(tags); }
        boolean notice() { return notice; }
        LocalDateTime createdAt() { return createdAt; }
        LocalDateTime updatedAt() { return updatedAt; }
        long viewCount() { return viewCount.get(); }
        long likeCount() { return likeCount.get(); }
        String category() { return tags.isEmpty() ? "잡담" : tags.get(0); }

        void incrementView() {
            viewCount.incrementAndGet();
        }

        void incrementLike() {
            likeCount.incrementAndGet();
        }

        void decrementLike() {
            likeCount.updateAndGet(current -> Math.max(0, current - 1));
        }
    }

    private record Comment(long id,
                           long postId,
                           long userId,
                           String author,
                           Long parentId,
                           String content,
                           LocalDateTime createdAt) {}

    public record CommunityBoardResponse(Long id, String slug, String name, String description) {}

    public record CommunityPostListItem(Long id,
                                        String boardSlug,
                                        String boardName,
                                        String title,
                                        String category,
                                        String author,
                                        Long userId,
                                        long viewCount,
                                        long likeCount,
                                        long commentCount,
                                        boolean notice,
                                        LocalDateTime createdAt) {}

    public record CommunityPostDetail(Long id,
                                      Long boardId,
                                      String boardSlug,
                                      String boardName,
                                      Long userId,
                                      String author,
                                      String title,
                                      String content,
                                      List<String> mediaUrls,
                                      List<String> tags,
                                      long viewCount,
                                      long likeCount,
                                      long commentCount,
                                      boolean notice,
                                      boolean isLiked,
                                      LocalDateTime createdAt,
                                      LocalDateTime updatedAt) {}

    public record CommunityCommentDetail(Long id,
                                          Long postId,
                                          Long userId,
                                          String author,
                                          Long parentId,
                                          String content,
                                          LocalDateTime createdAt,
                                          boolean isOwner) {}

    public record CommentCreateRequest(Long userId, Long parentId, String content) {}
}
