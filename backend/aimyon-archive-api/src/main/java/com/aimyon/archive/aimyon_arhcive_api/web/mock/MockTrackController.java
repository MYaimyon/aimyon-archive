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
                "Marigold",
                1,
                "4:56",
                "따뜻한 햇살 속 사랑을 그리는 곡",
                "https://www.youtube.com/watch?v=0g9dL92X7kc",
                new TrackDetailResponse.AlbumInfo(1L, "瞬間的シックスセンス", "순간적인 식스센스", "ALBUM", LocalDate.of(2019, 2, 13)),
                List.of(
                        new TrackDetailResponse.RelatedTrack(2L, "愛を伝えたいだとか", "사랑을 전하고 싶다든가"),
                        new TrackDetailResponse.RelatedTrack(3L, "桜が降る夜は", "벚꽃이 내리는 밤에는")
                ),
                List.of(
                        new TrackDetailResponse.Story(null, "LYRICS", "햇살과 노란 꽃을 모티프로 탄생", "Lyrics summary", null, "ja", LocalDate.of(2019, 2, 13))
                )
        );

        TrackDetailResponse track2 = new TrackDetailResponse(
                2L,
                1L,
                "愛を伝えたいだとか",
                "사랑을 전하고 싶다든가",
                2,
                "4:05",
                "솔직하고 다소 서툰 고백",
                "https://www.youtube.com/watch?v=CEQ1QzG1iS0",
                new TrackDetailResponse.AlbumInfo(1L, "瞬間的シックスセンス", "순간적인 식스센스", "ALBUM", LocalDate.of(2019, 2, 13)),
                List.of(
                        new TrackDetailResponse.RelatedTrack(1L, "マリーゴールド", "Marigold"),
                        new TrackDetailResponse.RelatedTrack(3L, "桜が降る夜は", "벚꽃이 내리는 밤에는")
                ),
                List.of()
        );

        TrackDetailResponse track3 = new TrackDetailResponse(
                3L,
                1L,
                "桜が降る夜は",
                "벚꽃이 내리는 밤에는",
                3,
                "4:07",
                "봄밤의 설렘과 씁쓸함",
                "https://www.youtube.com/watch?v=Np7d4jvKp5g",
                new TrackDetailResponse.AlbumInfo(1L, "瞬間的シックスセンス", "순간적인 식스센스", "ALBUM", LocalDate.of(2019, 2, 13)),
                List.of(new TrackDetailResponse.RelatedTrack(1L, "マリーゴールド", "Marigold")),
                List.of(new TrackDetailResponse.Story(null, "LYRICS", "벚꽃이 흩날리는 풍경에서 영감", "Lyric note", null, "ja", LocalDate.of(2019, 2, 13)))
        );

        TrackDetailResponse track4 = new TrackDetailResponse(
                4L,
                2L,
                "Good Night Baby",
                "Good Night Baby",
                1,
                "3:58",
                "늦은 밤을 감싸는 어쿠스틱", 
                null,
                new TrackDetailResponse.AlbumInfo(2L, "Heard That There's Good Pasta", "Good Pasta", "SINGLE", LocalDate.of(2020, 9, 9)),
                List.of(new TrackDetailResponse.RelatedTrack(5L, "Morning Pasta", "Morning Pasta")),
                List.of()
        );

        TrackDetailResponse track5 = new TrackDetailResponse(
                5L,
                2L,
                "Morning Pasta",
                "Morning Pasta",
                2,
                "4:12",
                "아침의 느긋함",
                null,
                new TrackDetailResponse.AlbumInfo(2L, "Heard That There's Good Pasta", "Good Pasta", "SINGLE", LocalDate.of(2020, 9, 9)),
                List.of(new TrackDetailResponse.RelatedTrack(4L, "Good Night Baby", "Good Night Baby")),
                List.of()
        );

        TrackDetailResponse track6 = new TrackDetailResponse(
                6L,
                3L,
                "Forever You",
                "Forever You",
                1,
                "5:01",
                "드라마 OST로 사용된 발라드",
                null,
                new TrackDetailResponse.AlbumInfo(3L, "Falling into Your Eyes Record", "Falling into Your Eyes", "EP", LocalDate.of(2022, 5, 11)),
                List.of(),
                List.of()
        );

        registerTrack(track1);
        registerTrack(track2);
        registerTrack(track3);
        registerTrack(track4);
        registerTrack(track5);
        registerTrack(track6);
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