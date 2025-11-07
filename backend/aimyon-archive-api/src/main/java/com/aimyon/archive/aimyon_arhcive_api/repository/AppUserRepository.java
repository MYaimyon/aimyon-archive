package com.aimyon.archive.aimyon_arhcive_api.repository;

import com.aimyon.archive.aimyon_arhcive_api.domain.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByUsername(String username);
    Optional<AppUser> findByEmail(String email);
    Optional<AppUser> findByUsernameOrEmail(String username, String email);
}

