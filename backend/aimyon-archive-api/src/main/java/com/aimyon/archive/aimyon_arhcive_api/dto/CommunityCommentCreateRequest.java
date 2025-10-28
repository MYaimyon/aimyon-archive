package com.aimyon.archive.aimyon_arhcive_api.dto;

public record CommunityCommentCreateRequest(
        Long userId,
        Long parentCommentId,
        String content
) {
}
