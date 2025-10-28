package com.aimyon.archive.aimyon_arhcive_api.repository;

import com.aimyon.archive.aimyon_arhcive_api.domain.CommunityBoard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CommunityBoardRepository extends JpaRepository<CommunityBoard, Long> {
    Optional<CommunityBoard> findBySlug(String slug);
}
