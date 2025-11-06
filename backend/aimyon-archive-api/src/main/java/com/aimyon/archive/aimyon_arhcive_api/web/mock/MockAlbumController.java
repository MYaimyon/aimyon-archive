package com.aimyon.archive.aimyon_arhcive_api.web.mock;

import com.aimyon.archive.aimyon_arhcive_api.dto.AlbumDetailResponse;
import com.aimyon.archive.aimyon_arhcive_api.dto.AlbumSummaryResponse;
import com.aimyon.archive.aimyon_arhcive_api.dto.PagedResponse;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@Profile("mock")
@RequestMapping("/api/albums")
public class MockAlbumController {

    private final Map<Long, AlbumDetailResponse> albums = new LinkedHashMap<>();
    private final List<AlbumSummaryResponse> summaries = new ArrayList<>();

    public MockAlbumController() {
        AlbumDetailResponse album1 = new AlbumDetailResponse(
                1L,
                "瞬間的シックスセンス",
                "순간적인 식스센스",
                "ALBUM",
                LocalDate.of(2019, 2, 13),
                "기타 사운드와 솔직한 가사가 담긴 대표 정규 앨범.",
                "https://i.scdn.co/image/ab67616d0000b2732a7b82d49f683e4c2aaca5ae",
                List.of("Band Sound", "Aimyon"),
                List.of(
                        new AlbumDetailResponse.TrackInAlbum(1L, "マリーゴールド", "Marigold", 1, "4:56", "따뜻한 햇살 속 러브송"),
                        new AlbumDetailResponse.TrackInAlbum(2L, "愛を伝えたいだとか", "사랑을 전하고 싶다든가", 2, "4:05", "솔직한 고백"),
                        new AlbumDetailResponse.TrackInAlbum(3L, "桜が降る夜は", "벚꽃이 내리는 밤에는", 3, "4:07", "봄밤의 설렘")
                )
        );

        AlbumDetailResponse album2 = new AlbumDetailResponse(
                2L,
                "Heard That There's Good Pasta",
                "Good Pasta",
                "SINGLE",
                LocalDate.of(2020, 9, 9),
                "밤의 카페를 닮은 어쿠스틱 싱글.",
                "https://i.scdn.co/image/ab67616d0000b27350894b1c06b9d3170f12aee2",
                List.of("Acoustic", "Chill"),
                List.of(
                        new AlbumDetailResponse.TrackInAlbum(4L, "Good Night Baby", "Good Night Baby", 1, "3:58", "밤에 듣기 좋은 곡"),
                        new AlbumDetailResponse.TrackInAlbum(5L, "Morning Pasta", "Morning Pasta", 2, "4:12", "아침 감성")
                )
        );

        AlbumDetailResponse album3 = new AlbumDetailResponse(
                3L,
                "Falling into Your Eyes Record",
                "Falling into Your Eyes",
                "EP",
                LocalDate.of(2022, 5, 11),
                "드라마 사운드트랙을 담은 EP.",
                "https://i.scdn.co/image/ab67616d0000b2731b2e08ce56d69d0e94d55bd5",
                List.of("Drama OST", "Ballad"),
                List.of(
                        new AlbumDetailResponse.TrackInAlbum(6L, "Forever You", "Forever You", 1, "5:01", "헌신을 노래하는 발라드")
                )
        );

        registerAlbum(album1);
        registerAlbum(album2);
        registerAlbum(album3);
    }

    @GetMapping
    public PagedResponse<AlbumSummaryResponse> getAlbums() {
        return new PagedResponse<>(summaries, 0, summaries.size(), summaries.size(), 1);
    }

    @GetMapping("/{albumId}")
    public AlbumDetailResponse getAlbum(@PathVariable Long albumId) {
        AlbumDetailResponse response = albums.get(albumId);
        if (response == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Album not found");
        }
        return response;
    }

    private void registerAlbum(AlbumDetailResponse album) {
        albums.put(album.id(), album);
        summaries.add(new AlbumSummaryResponse(
                album.id(),
                album.titleJa(),
                album.titleKo(),
                album.type(),
                album.releaseDate(),
                album.coverUrl(),
                album.tags()
        ));
    }
}