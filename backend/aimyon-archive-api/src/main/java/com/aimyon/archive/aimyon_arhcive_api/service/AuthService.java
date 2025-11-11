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
        // Frontend no longer enforces complexity; keep only basic length via DTO.
        // Additional complexity checks removed for local profile convenience.

        userRepository.findByUsername(req.username()).ifPresent(u -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        });
        userRepository.findByEmail(req.email()).ifPresent(u -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        });

        if (Boolean.FALSE.equals(req.agreeTerms()) || Boolean.FALSE.equals(req.agreePrivacy())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Terms and privacy agreements are required");
        }

        AppUser saved = userRepository.save(AppUser.builder()
                .username(req.username())
                .email(req.email())
                .passwordHash(passwordEncoder.encode(req.password()))
                .displayName(req.displayName())
                .phoneNumber(req.phoneNumber())
                .birthDate(req.birthDate())
                .gender(req.gender())
                .marketingOptIn(req.marketingOptIn() != null && req.marketingOptIn())
                .termsAgreed(req.agreeTerms())
                .privacyAgreed(req.agreePrivacy())
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

    public boolean isUsernameAvailable(String username) {
        return userRepository.findByUsername(username).isEmpty();
    }

    public boolean isEmailAvailable(String email) {
        return userRepository.findByEmail(email).isEmpty();
    }

    private void validatePassword(String password) {
        // No-op: DTO enforces @Size(min=8). Remove extra complexity requirements.
    }
}
