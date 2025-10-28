package com.aimyon.archive.aimyon_arhcive_api.dto;

import java.time.LocalDateTime;
import java.util.List;

public record CommunityPostResponse(
        Long id,
        Long boardId,
        String boardSlug,
        Long userId,
        String title,
        String content,
        List<String> mediaUrls,
        List<String> tags,
        Long likeCount,
        Long commentCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
