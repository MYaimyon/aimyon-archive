package com.aimyon.archive.aimyon_arhcive_api.dto;

import java.time.LocalDate;
import java.util.List;

public record NewsEventRequest(
        String title,
        String summary,
        String content,
        String type,
        LocalDate eventDate,
        String location,
        List<String> tags
) {
}
