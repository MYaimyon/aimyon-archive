package com.aimyon.archive.aimyon_arhcive_api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public class AuthDtos {
    public record RegisterRequest(
            @NotBlank @Size(min = 3, max = 50) String username,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6, max = 100) String password
    ) {}

    public record LoginRequest(
            @NotBlank String usernameOrEmail,
            @NotBlank String password
    ) {}

    public record AuthResponse(
            Long userId,
            String username,
            List<String> roles,
            String token
    ) {}
}

