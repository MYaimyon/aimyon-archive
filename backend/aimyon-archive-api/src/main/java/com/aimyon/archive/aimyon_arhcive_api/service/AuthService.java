package com.aimyon.archive.aimyon_arhcive_api.service;

import com.aimyon.archive.aimyon_arhcive_api.domain.AppUser;
import com.aimyon.archive.aimyon_arhcive_api.dto.AuthDtos;
import com.aimyon.archive.aimyon_arhcive_api.repository.AppUserRepository;
import com.aimyon.archive.aimyon_arhcive_api.security.JwtUtil;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Profile("local")
@Transactional(readOnly = true)
public class AuthService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(AppUserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest req) {
        userRepository.findByUsername(req.username()).ifPresent(u -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        });
        userRepository.findByEmail(req.email()).ifPresent(u -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        });

        AppUser saved = userRepository.save(AppUser.builder()
                .username(req.username())
                .email(req.email())
                .passwordHash(passwordEncoder.encode(req.password()))
                .roles(List.of("USER"))
                .build());

        String token = jwtUtil.generate(saved.getId(), saved.getUsername(), saved.getRoles());
        return new AuthDtos.AuthResponse(saved.getId(), saved.getUsername(), saved.getRoles(), token);
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest req) {
        AppUser user = userRepository.findByUsernameOrEmail(req.usernameOrEmail(), req.usernameOrEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        String token = jwtUtil.generate(user.getId(), user.getUsername(), user.getRoles());
        return new AuthDtos.AuthResponse(user.getId(), user.getUsername(), user.getRoles(), token);
    }
}

