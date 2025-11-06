package com.aimyon.archive.aimyon_arhcive_api.service;

import com.aimyon.archive.aimyon_arhcive_api.domain.CommunityBoard;
import com.aimyon.archive.aimyon_arhcive_api.domain.CommunityComment;
import com.aimyon.archive.aimyon_arhcive_api.domain.CommunityPost;
import com.aimyon.archive.aimyon_arhcive_api.domain.PostLike;
import com.aimyon.archive.aimyon_arhcive_api.dto.*;
import com.aimyon.archive.aimyon_arhcive_api.repository.CommunityBoardRepository;
import com.aimyon.archive.aimyon_arhcive_api.repository.CommunityCommentRepository;
import com.aimyon.archive.aimyon_arhcive_api.repository.CommunityPostRepository;
import com.aimyon.archive.aimyon_arhcive_api.repository.PostLikeRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
@Profile("!mock")
@Transactional(readOnly = true)
public class CommunityService {

    private final CommunityBoardRepository boardRepository;
    private final CommunityPostRepository postRepository;
    private final CommunityCommentRepository commentRepository;
    private final PostLikeRepository postLikeRepository;

    public CommunityService(CommunityBoardRepository boardRepository,
                            CommunityPostRepository postRepository,
                            CommunityCommentRepository commentRepository,
                            PostLikeRepository postLikeRepository) {
        this.boardRepository = boardRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.postLikeRepository = postLikeRepository;
    }

    public List<CommunityBoardResponse> getBoards() {
        return boardRepository.findAll().stream()
                .map(this::toBoardResponse)
                .toList();
    }

    public Page<CommunityPostResponse> getPosts(String boardSlug, Pageable pageable) {
        CommunityBoard board = boardRepository.findBySlug(boardSlug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Board not found"));

        return postRepository.findByBoard(board, pageable)
                .map(post -> toPostResponse(post, board));
    }

    public CommunityPostResponse getPost(Long postId) {
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        CommunityBoard board = post.getBoard();
        return toPostResponse(post, board);
    }

    public List<CommunityCommentResponse> getComments(Long postId) {
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        return commentRepository.findByPostOrderByCreatedAtAsc(post).stream()
                .map(this::toCommentResponse)
                .toList();
    }

    @Transactional
    public CommunityPostResponse createPost(CommunityPostCreateRequest request) {
        validateUser(request.userId());
        CommunityBoard board = boardRepository.findBySlug(request.boardSlug())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Board not found"));

        if (!StringUtils.hasText(request.title()) || !StringUtils.hasText(request.content())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title and content are required");
        }

        CommunityPost post = CommunityPost.builder()
                .board(board)
                .userId(request.userId())
                .title(request.title())
                .content(request.content())
                .build();

        post.getMediaUrls().addAll(copyToMutableList(request.mediaUrls()));
        post.getTags().addAll(copyToMutableList(request.tags()));

        CommunityPost saved = postRepository.save(post);
        return toPostResponse(saved, board);
    }

    @Transactional
    public CommunityPostResponse updatePost(Long postId, CommunityPostUpdateRequest request) {
        validateUser(request.userId());
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        if (!post.getUserId().equals(request.userId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only edit your own post");
        }

        if (StringUtils.hasText(request.title())) {
            post.changeTitle(request.title());
        }
        if (StringUtils.hasText(request.content())) {
            post.changeContent(request.content());
        }

        post.getMediaUrls().clear();
        post.getMediaUrls().addAll(copyToMutableList(request.mediaUrls()));

        post.getTags().clear();
        post.getTags().addAll(copyToMutableList(request.tags()));

        return toPostResponse(post, post.getBoard());
    }

    @Transactional
    public void deletePost(Long postId, Long requesterId, boolean isAdmin) {
        validateUser(requesterId);
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        if (!isAdmin && !post.getUserId().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own post");
        }

        postRepository.delete(post);
    }

    @Transactional
    public CommunityCommentResponse addComment(Long postId, CommunityCommentCreateRequest request) {
        validateUser(request.userId());
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        if (!StringUtils.hasText(request.content())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Content is required");
        }

        CommunityComment parent = null;
        if (request.parentCommentId() != null) {
            parent = commentRepository.findById(request.parentCommentId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent comment not found"));
            if (!parent.getPost().getId().equals(post.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parent comment belongs to a different post");
            }
        }

        CommunityComment comment = CommunityComment.builder()
                .post(post)
                .parent(parent)
                .userId(request.userId())
                .content(request.content())
                .build();

        post.increaseCommentCount();
        CommunityComment saved = commentRepository.save(comment);
        return toCommentResponse(saved);
    }

    @Transactional
    public void deleteComment(Long commentId, Long requesterId, boolean isAdmin) {
        validateUser(requesterId);
        CommunityComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

        if (!isAdmin && !comment.getUserId().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own comment");
        }

        CommunityPost post = comment.getPost();
        commentRepository.delete(comment);
        post.decreaseCommentCount();
    }

    @Transactional
    public CommunityPostResponse likePost(Long postId, Long userId) {
        validateUser(userId);
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        postLikeRepository.findByPostAndUserId(post, userId)
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Already liked");
                });

        PostLike like = PostLike.builder()
                .post(post)
                .userId(userId)
                .build();

        postLikeRepository.save(like);
        post.increaseLikeCount();

        return toPostResponse(post, post.getBoard());
    }

    @Transactional
    public CommunityPostResponse unlikePost(Long postId, Long userId) {
        validateUser(userId);
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        PostLike like = postLikeRepository.findByPostAndUserId(post, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Like not found"));

        postLikeRepository.delete(like);
        post.decreaseLikeCount();

        return toPostResponse(post, post.getBoard());
    }

    private CommunityBoardResponse toBoardResponse(CommunityBoard board) {
        return new CommunityBoardResponse(
                board.getId(),
                board.getSlug(),
                board.getName(),
                board.getDescription()
        );
    }

    private CommunityPostResponse toPostResponse(CommunityPost post, CommunityBoard board) {
        return new CommunityPostResponse(
                post.getId(),
                board.getId(),
                board.getSlug(),
                post.getUserId(),
                post.getTitle(),
                post.getContent(),
                List.copyOf(post.getMediaUrls()),
                List.copyOf(post.getTags()),
                post.getLikeCount(),
                post.getCommentCount(),
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }

    private CommunityCommentResponse toCommentResponse(CommunityComment comment) {
        return new CommunityCommentResponse(
                comment.getId(),
                comment.getPost().getId(),
                comment.getUserId(),
                comment.getParent() != null ? comment.getParent().getId() : null,
                comment.getContent(),
                comment.getCreatedAt()
        );
    }

    private void validateUser(Long userId) {
        if (userId == null || userId <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid user");
        }
    }

    private List<String> copyToMutableList(List<String> source) {
        return source == null ? new ArrayList<>() : new ArrayList<>(source);
    }
}
