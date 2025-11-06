package com.aimyon.archive.aimyon_arhcive_api.web;

import com.aimyon.archive.aimyon_arhcive_api.dto.PagedResponse;
import com.aimyon.archive.aimyon_arhcive_api.dto.TrackDetailResponse;
import com.aimyon.archive.aimyon_arhcive_api.dto.TrackSummaryResponse;
import com.aimyon.archive.aimyon_arhcive_api.service.TrackService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Profile("!mock")
@RequestMapping("/api/tracks")
public class TrackController {

    private final TrackService trackService;

    public TrackController(TrackService trackService) {
        this.trackService = trackService;
    }

    @GetMapping
    public PagedResponse<TrackSummaryResponse> getTracks(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long albumId,
            @PageableDefault(size = 20, sort = "trackNo", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return trackService.searchTracks(keyword, albumId, pageable);
    }

    @GetMapping("/{trackId}")
    public TrackDetailResponse getTrack(@PathVariable Long trackId) {
        return trackService.getTrack(trackId);
    }
}
