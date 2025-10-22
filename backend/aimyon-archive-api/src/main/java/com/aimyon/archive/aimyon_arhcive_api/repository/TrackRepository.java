package com.aimyon.archive.aimyon_arhcive_api.repository;

import com.aimyon.archive.aimyon_arhcive_api.domain.Track;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TrackRepository extends JpaRepository<Track, Long> {

    @Query("""
            select t from Track t
            where (:albumId is null or t.album.id = :albumId)
              and (:keyword is null or lower(t.titleJa) like lower(concat('%', :keyword, '%'))
                   or lower(t.titleKo) like lower(concat('%', :keyword, '%')))
            """)
    Page<Track> search(@Param("albumId") Long albumId,
                       @Param("keyword") String keyword,
                       Pageable pageable);

    @EntityGraph(attributePaths = {"album", "album.tracks"})
    Optional<Track> findWithAlbumById(Long id);
}
