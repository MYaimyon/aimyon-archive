package com.aimyon.archive.aimyon_arhcive_api.service;

import com.aimyon.archive.aimyon_arhcive_api.domain.Album;
import com.aimyon.archive.aimyon_arhcive_api.domain.Track;
import com.aimyon.archive.aimyon_arhcive_api.dto.AlbumDetailResponse;
import com.aimyon.archive.aimyon_arhcive_api.dto.AlbumSummaryResponse;
import com.aimyon.archive.aimyon_arhcive_api.dto.PagedResponse;
import com.aimyon.archive.aimyon_arhcive_api.repository.AlbumRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class AlbumService {

    private final AlbumRepository albumRepository;

    public AlbumService(AlbumRepository albumRepository) {
        this.albumRepository = albumRepository;
    }

    public PagedResponse<AlbumSummaryResponse> getAlbums(String type, Integer year, String keyword, Pageable pageable) {
        Specification<Album> spec = Specification.where(null);

        if (StringUtils.hasText(type)) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("type"), type));
        }

        if (year != null) {
            spec = spec.and((root, query, cb) -> cb.equal(cb.function("year", Integer.class, root.get("releaseDate")), year));
        }

        if (StringUtils.hasText(keyword)) {
            String like = "%" + keyword.toLowerCase(Locale.ROOT) + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("titleJa")), like),
                    cb.like(cb.lower(root.get("titleKo")), like),
                    cb.like(cb.lower(root.get("description")), like)
            ));
        }

        Page<AlbumSummaryResponse> page = albumRepository
                .findAll(spec, pageable)
                .map(this::toSummaryResponse);

        return PagedResponse.from(page);
    }

    public AlbumDetailResponse getAlbum(Long albumId) {
        Album album = albumRepository.findWithTracksById(albumId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Album not found"));

        album.getTracks().sort(Comparator
                .comparing(Track::getTrackNo, Comparator.nullsLast(Integer::compareTo))
                .thenComparing(Track::getId));

        return toDetailResponse(album);
    }

    private AlbumSummaryResponse toSummaryResponse(Album album) {
        return new AlbumSummaryResponse(
                album.getId(),
                album.getTitleJa(),
                album.getTitleKo(),
                album.getType(),
                album.getReleaseDate(),
                album.getCoverUrl(),
                List.copyOf(album.getTags())
        );
    }

    private AlbumDetailResponse toDetailResponse(Album album) {
        return new AlbumDetailResponse(
                album.getId(),
                album.getTitleJa(),
                album.getTitleKo(),
                album.getType(),
                album.getReleaseDate(),
                album.getDescription(),
                album.getCoverUrl(),
                List.copyOf(album.getTags()),
                album.getTracks().stream()
                        .sorted(Comparator
                                .comparing(Track::getTrackNo, Comparator.nullsLast(Integer::compareTo))
                                .thenComparing(Track::getId))
                        .map(track -> new AlbumDetailResponse.TrackInAlbum(
                                track.getId(),
                                track.getTitleJa(),
                                track.getTitleKo(),
                                track.getTrackNo(),
                                track.getDuration(),
                                track.getLyricsSummary()
                        ))
                        .toList()
        );
    }
}
