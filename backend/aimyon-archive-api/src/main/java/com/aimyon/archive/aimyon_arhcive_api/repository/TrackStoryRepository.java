package com.aimyon.archive.aimyon_arhcive_api.repository;

import com.aimyon.archive.aimyon_arhcive_api.domain.Track;
import com.aimyon.archive.aimyon_arhcive_api.domain.TrackStory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrackStoryRepository extends JpaRepository<TrackStory, Long> {

    List<TrackStory> findByTrackOrderByCreatedAtAsc(Track track);
}
