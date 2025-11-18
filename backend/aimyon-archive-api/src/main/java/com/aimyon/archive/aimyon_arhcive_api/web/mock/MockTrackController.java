package com.aimyon.archive.aimyon_arhcive_api.web.mock;

import com.aimyon.archive.aimyon_arhcive_api.dto.PagedResponse;
import com.aimyon.archive.aimyon_arhcive_api.dto.TrackDetailResponse;
import com.aimyon.archive.aimyon_arhcive_api.dto.TrackSummaryResponse;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@Profile("mock")
@RequestMapping("/api/tracks")
public class MockTrackController {

    private final Map<Long, TrackDetailResponse> tracks = new LinkedHashMap<>();
    private final List<TrackSummaryResponse> summaries = new ArrayList<>();

    public MockTrackController() {
        TrackDetailResponse track1 = new TrackDetailResponse(
                1L,
                1L,
                "マリーゴールド",
                "마리골드",
                1,
                "4:56",
                "", // lyrics (mock)
                "여름날의 햇살 같은 포크 록 발라드",
                "https://www.youtube.com/watch?v=0g9dL92X7kc",
                new TrackDetailResponse.AlbumInfo(
                        1L,
                        "瞬間的シックスセンス",
                        "순간적 식스 센스",
                        "ALBUM",
                        LocalDate.of(2019, 2, 13)
                ),
                List.of(
                        new TrackDetailResponse.RelatedTrack(2L, "君はロックを聴かない", "너는 록을 듣지 않아")
                ),
                List.of(
                        new TrackDetailResponse.Story(
                                null,
                                "BACKGROUND",
                                "여름 저녁 공원을 걷다 떠올린 멜로디에서 시작된 곡입니다.",
                                "Lyrics summary",
                                null,
                                "ja",
                                LocalDate.of(2019, 2, 13)
                        )
                )
        );

        TrackDetailResponse track2 = new TrackDetailResponse(
                2L,
                1L,
                "君はロックを聴かない",
                "너는 록을 듣지 않아",
                2,
                "4:05",
                "", // lyrics (mock)
                "서투른 마음을 솔직하게 담은 고백송",
                "https://www.youtube.com/watch?v=CEQ1QzG1iS0",
                new TrackDetailResponse.AlbumInfo(
                        1L,
                        "瞬間的シックスセンス",
                        "순간적 식스 센스",
                        "ALBUM",
                        LocalDate.of(2019, 2, 13)
                ),
                List.of(
                        new TrackDetailResponse.RelatedTrack(1L, "マリーゴールド", "마리골드")
                ),
                List.of()
        );

        registerTrack(track1);
        registerTrack(track2);
    }

    @GetMapping
    public PagedResponse<TrackSummaryResponse> searchTracks(@RequestParam(required = false) String keyword,
                                                            @RequestParam(required = false) Long albumId) {
        List<TrackSummaryResponse> filtered = summaries.stream()
                .filter(summary -> albumId == null || summary.albumId().equals(albumId))
                .filter(summary -> keyword == null || summary.titleJa().toLowerCase().contains(keyword.toLowerCase()))
                .toList();

        return new PagedResponse<>(filtered, 0, filtered.size(), filtered.size(), 1);
    }

    @GetMapping("/{trackId}")
    public TrackDetailResponse getTrack(@PathVariable Long trackId) {
        TrackDetailResponse response = tracks.get(trackId);
        if (response == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Track not found");
        }
        return response;
    }

    private void registerTrack(TrackDetailResponse track) {
        tracks.put(track.id(), track);
        summaries.add(new TrackSummaryResponse(
                track.id(),
                track.albumId(),
                track.titleJa(),
                track.titleKo(),
                track.trackNo()
        ));
    }
}
