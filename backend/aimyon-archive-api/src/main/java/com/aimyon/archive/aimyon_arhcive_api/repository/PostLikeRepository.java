package com.aimyon.archive.aimyon_arhcive_api.repository;

import com.aimyon.archive.aimyon_arhcive_api.domain.CommunityPost;
import com.aimyon.archive.aimyon_arhcive_api.domain.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    Optional<PostLike> findByPostAndUserId(CommunityPost post, Long userId);
    long countByPost(CommunityPost post);
}
