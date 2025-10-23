package com.aimyon.archive.aimyon_arhcive_api.dto;

import java.time.LocalDate;
import java.util.List;

public record TrackDetailResponse(
        Long id,
        Long albumId,
        String titleJa,
        String titleKo,
        Integer trackNo,
        String duration,
        String lyricsSummary,
        String mvUrl,
        AlbumInfo album,
        List<RelatedTrack> relatedTracks,
        List<Story> stories
) {
    public record AlbumInfo(Long id, String titleJa, String titleKo, String type, LocalDate releaseDate) {}

    public record RelatedTrack(Long id, String titleJa, String titleKo) {}

    public record Story(Long id, String category, String content, String source, LocalDate publishedAt) {}
}
