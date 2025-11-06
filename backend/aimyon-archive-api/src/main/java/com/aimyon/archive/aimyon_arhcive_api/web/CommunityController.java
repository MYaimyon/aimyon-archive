package com.aimyon.archive.aimyon_arhcive_api.web;

import com.aimyon.archive.aimyon_arhcive_api.dto.*;
import com.aimyon.archive.aimyon_arhcive_api.service.CommunityService;
import org.springframework.context.annotation.Profile;
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
    public CommunityPostResponse createPost(@RequestBody CommunityPostCreateRequest request) {
        return communityService.createPost(request);
    }

    @PutMapping("/posts/{postId}")
    public CommunityPostResponse updatePost(@PathVariable Long postId,
                                            @RequestBody CommunityPostUpdateRequest request) {
        return communityService.updatePost(postId, request);
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
