package com.aimyon.archive.aimyon_arhcive_api.dto;

import java.util.List;

public record CommunityPostUpdateRequest(
        Long userId,
        String title,
        String content,
        List<String> mediaUrls,
        List<String> tags
) {
}
