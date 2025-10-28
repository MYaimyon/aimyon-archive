package com.aimyon.archive.aimyon_arhcive_api.dto;

import java.util.List;

public record CommunityPostCreateRequest(
        Long userId,
        String boardSlug,
        String title,
        String content,
        List<String> mediaUrls,
        List<String> tags
) {
}
