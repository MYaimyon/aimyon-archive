package com.aimyon.archive.aimyon_arhcive_api.web;

import com.aimyon.archive.aimyon_arhcive_api.dto.*;
import com.aimyon.archive.aimyon_arhcive_api.service.CommunityService;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.Authentication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Profile("!mock")
@RequestMapping("/api/community")
public class CommunityController {

    private final CommunityService communityService;

    public CommunityController(CommunityService communityService) {
        this.communityService = communityService;
    }

    @GetMapping("/boards")
    public List<CommunityBoardResponse> getBoards() {
        return communityService.getBoards();
    }

    @GetMapping("/posts")
    public PagedResponse<CommunityPostResponse> getPosts(
            @RequestParam String board,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<CommunityPostResponse> page = communityService.getPosts(board, pageable);
        return PagedResponse.from(page);
    }

    @GetMapping("/posts/{postId}")
    public CommunityPostResponse getPost(@PathVariable Long postId) {
        return communityService.getPost(postId);
    }

    @GetMapping("/posts/{postId}/comments")
    public List<CommunityCommentResponse> getComments(@PathVariable Long postId) {
        return communityService.getComments(postId);
    }

    @PostMapping("/posts")
    @ResponseStatus(HttpStatus.CREATED)
    public CommunityPostResponse createPost(@RequestBody CommunityPostCreateRequest request, Authentication auth) {
        Long currentUserId = tryResolveUserId(auth);
        if (currentUserId != null && request.userId() != null && !request.userId().equals(currentUserId)) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN, "User mismatch");
        }
        return communityService.createPost(request);
    }

    @PutMapping("/posts/{postId}")
    public CommunityPostResponse updatePost(@PathVariable Long postId,
                                            @RequestBody CommunityPostUpdateRequest request,
                                            Authentication auth) {
        Long currentUserId = tryResolveUserId(auth);
        if (currentUserId != null && request.userId() != null && !request.userId().equals(currentUserId)) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN, "User mismatch");
        }
        return communityService.updatePost(postId, request);
    }

    private Long tryResolveUserId(Authentication auth) {
        try {
            if (auth == null) return null;
            var method = auth.getClass().getMethod("getUserId");
            Object val = method.invoke(auth);
            if (val instanceof Long l) return l;
            if (val instanceof Number n) return n.longValue();
            if (val != null) return Long.valueOf(String.valueOf(val));
        } catch (Exception ignored) {}
        return null;
    }

    @DeleteMapping("/posts/{postId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePost(@PathVariable Long postId,
                           @RequestParam Long userId,
                           @RequestParam(defaultValue = "false") boolean admin) {
        communityService.deletePost(postId, userId, admin);
    }

    @PostMapping("/posts/{postId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommunityCommentResponse addComment(@PathVariable Long postId,
                                               @RequestBody CommunityCommentCreateRequest request) {
        return communityService.addComment(postId, request);
    }

    @DeleteMapping("/comments/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(@PathVariable Long commentId,
                              @RequestParam Long userId,
                              @RequestParam(defaultValue = "false") boolean admin) {
        communityService.deleteComment(commentId, userId, admin);
    }

    @PostMapping("/posts/{postId}/like")
    public CommunityPostResponse likePost(@PathVariable Long postId,
                                          @RequestParam Long userId) {
        return communityService.likePost(postId, userId);
    }

    @DeleteMapping("/posts/{postId}/like")
    public CommunityPostResponse unlikePost(@PathVariable Long postId,
                                            @RequestParam Long userId) {
        return communityService.unlikePost(postId, userId);
    }
}
