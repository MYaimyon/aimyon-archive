package com.aimyon.archive.aimyon_arhcive_api.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record NewsEventResponse(
        Long id,
        String title,
        String summary,
        String content,
        String type,
        LocalDate eventDate,
        String location,
        List<String> tags,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
