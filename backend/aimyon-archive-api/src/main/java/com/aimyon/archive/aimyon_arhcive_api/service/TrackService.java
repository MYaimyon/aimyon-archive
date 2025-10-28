package com.aimyon.archive.aimyon_arhcive_api.service;

import com.aimyon.archive.aimyon_arhcive_api.domain.Track;
import com.aimyon.archive.aimyon_arhcive_api.domain.TrackStory;
import com.aimyon.archive.aimyon_arhcive_api.dto.PagedResponse;
import com.aimyon.archive.aimyon_arhcive_api.dto.TrackDetailResponse;
import com.aimyon.archive.aimyon_arhcive_api.dto.TrackSummaryResponse;
import com.aimyon.archive.aimyon_arhcive_api.repository.TrackRepository;
import com.aimyon.archive.aimyon_arhcive_api.repository.TrackStoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class TrackService {

    private final TrackRepository trackRepository;
    private final TrackStoryRepository trackStoryRepository;

    public TrackService(TrackRepository trackRepository,
                        TrackStoryRepository trackStoryRepository) {
        this.trackRepository = trackRepository;
        this.trackStoryRepository = trackStoryRepository;
    }

    public PagedResponse<TrackSummaryResponse> searchTracks(String keyword, Long albumId, Pageable pageable) {
        String normalizedKeyword = StringUtils.hasText(keyword) ? keyword.toLowerCase(Locale.ROOT) : null;
        Page<TrackSummaryResponse> page = trackRepository
                .search(albumId, normalizedKeyword, pageable)
                .map(track -> new TrackSummaryResponse(
                        track.getId(),
                        track.getAlbum().getId(),
                        track.getTitleJa(),
                        track.getTitleKo(),
                        track.getTrackNo()
                ));
        return PagedResponse.from(page);
    }

    public TrackDetailResponse getTrack(Long trackId) {
        Track track = trackRepository.findWithAlbumById(trackId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Track not found"));

        var album = track.getAlbum();

        List<TrackDetailResponse.RelatedTrack> relatedTracks = album.getTracks().stream()
                .filter(other -> !other.getId().equals(track.getId()))
                .map(other -> new TrackDetailResponse.RelatedTrack(
                        other.getId(),
                        other.getTitleJa(),
                        other.getTitleKo()
                ))
                .toList();

        List<TrackDetailResponse.Story> stories = buildStories(track, album.getReleaseDate());

        return new TrackDetailResponse(
                track.getId(),
                album.getId(),
                track.getTitleJa(),
                track.getTitleKo(),
                track.getTrackNo(),
                track.getDuration(),
                track.getLyricsSummary(),
                track.getMvUrl(),
                new TrackDetailResponse.AlbumInfo(
                        album.getId(),
                        album.getTitleJa(),
                        album.getTitleKo(),
                        album.getType(),
                        album.getReleaseDate()
                ),
                relatedTracks,
                stories
        );
    }

    private List<TrackDetailResponse.Story> buildStories(Track track, LocalDate albumReleaseDate) {
        List<TrackDetailResponse.Story> result = new ArrayList<>();

        if (StringUtils.hasText(track.getLyricsSummary())) {
            result.add(new TrackDetailResponse.Story(
                    null,
                    "LYRICS",
                    track.getLyricsSummary(),
                    "Lyrics summary",
                    null,
                    null,
                    albumReleaseDate
            ));
        }

        List<TrackStory> storyEntities = trackStoryRepository.findByTrackOrderByCreatedAtAsc(track);
        storyEntities.stream()
                .map(story -> new TrackDetailResponse.Story(
                        story.getId(),
                        story.getCategory(),
                        story.getContent(),
                        story.getSourceName(),
                        story.getSourceUrl(),
                        story.getLanguage(),
                        story.getCreatedAt() != null ? story.getCreatedAt().toLocalDate() : null
                ))
                .forEach(result::add);

        return result;
    }
}
