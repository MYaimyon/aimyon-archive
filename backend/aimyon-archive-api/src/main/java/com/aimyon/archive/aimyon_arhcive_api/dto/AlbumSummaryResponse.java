package com.aimyon.archive.aimyon_arhcive_api.dto;

import java.time.LocalDate;
import java.util.List;

public record AlbumSummaryResponse(
        Long id,
        String titleJa,
        String titleKo,
        String type,
        LocalDate releaseDate,
        String coverUrl,
        List<String> tags
) {}
