package com.aimyon.archive.aimyon_arhcive_api.dto;

import java.time.LocalDate;
import java.util.List;

public record AlbumDetailResponse(
        Long id,
        String titleJa,
        String titleKo,
        String type,
        LocalDate releaseDate,
        String description,
        String coverUrl,
        List<String> tags,
        List<TrackInAlbum> tracks
) {
    public record TrackInAlbum(
            Long id,
            String titleJa,
            String titleKo,
            Integer trackNo,
            String duration,
            String lyricsSummary
    ) {}
}
