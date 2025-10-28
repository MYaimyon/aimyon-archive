package com.aimyon.archive.aimyon_arhcive_api.repository;

import com.aimyon.archive.aimyon_arhcive_api.domain.NewsEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NewsEventRepository extends JpaRepository<NewsEvent, Long> {

    Page<NewsEvent> findByType(String type, Pageable pageable);
}
