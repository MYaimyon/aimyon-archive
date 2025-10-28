package com.aimyon.archive.aimyon_arhcive_api.web;

import com.aimyon.archive.aimyon_arhcive_api.dto.TrackStoryResponse;
import com.aimyon.archive.aimyon_arhcive_api.service.TrackStoryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tracks/{trackId}/stories")
public class TrackStoryController {

    private final TrackStoryService trackStoryService;

    public TrackStoryController(TrackStoryService trackStoryService) {
        this.trackStoryService = trackStoryService;
    }

    @GetMapping
    public List<TrackStoryResponse> getTrackStories(@PathVariable Long trackId) {
        return trackStoryService.getStories(trackId);
    }
}
