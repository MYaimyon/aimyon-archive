package com.aimyon.archive.aimyon_arhcive_api.service;

import com.aimyon.archive.aimyon_arhcive_api.domain.Track;
import com.aimyon.archive.aimyon_arhcive_api.dto.TrackStoryResponse;
import com.aimyon.archive.aimyon_arhcive_api.repository.TrackRepository;
import com.aimyon.archive.aimyon_arhcive_api.repository.TrackStoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class TrackStoryService {

    private final TrackRepository trackRepository;
    private final TrackStoryRepository trackStoryRepository;

    public TrackStoryService(TrackRepository trackRepository, TrackStoryRepository trackStoryRepository) {
        this.trackRepository = trackRepository;
        this.trackStoryRepository = trackStoryRepository;
    }

    public List<TrackStoryResponse> getStories(Long trackId) {
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Track not found"));

        return trackStoryRepository.findByTrackOrderByCreatedAtAsc(track).stream()
                .map(story -> new TrackStoryResponse(
                        story.getId(),
                        track.getId(),
                        story.getCategory(),
                        story.getContent(),
                        story.getSourceName(),
                        story.getSourceUrl(),
                        story.getLanguage(),
                        story.getCreatedAt(),
                        story.getUpdatedAt()
                ))
                .toList();
    }
}
