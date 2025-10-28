package com.aimyon.archive.aimyon_arhcive_api.repository;

import com.aimyon.archive.aimyon_arhcive_api.domain.CommunityBoard;
import com.aimyon.archive.aimyon_arhcive_api.domain.CommunityPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {

    Page<CommunityPost> findByBoard(CommunityBoard board, Pageable pageable);
}
