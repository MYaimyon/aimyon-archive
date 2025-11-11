package com.aimyon.archive.aimyon_arhcive_api.dto;

import java.time.LocalDateTime;

public record CommunityCommentResponse(
        Long id,
        Long postId,
        Long userId,
        String author,
        Long parentId,
        String content,
        LocalDateTime createdAt
) {
}
