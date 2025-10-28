package com.aimyon.archive.aimyon_arhcive_api.dto;

import java.time.LocalDateTime;

public record TrackStoryResponse(
        Long id,
        Long trackId,
        String category,
        String content,
        String sourceName,
        String sourceUrl,
        String language,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
