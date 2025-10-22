package com.aimyon.archive.aimyon_arhcive_api.dto;

public record TrackSummaryResponse(
        Long id,
        Long albumId,
        String titleJa,
        String titleKo,
        Integer trackNo
) {}
