package com.aimyon.archive.aimyon_arhcive_api.dto;

import com.aimyon.archive.aimyon_arhcive_api.config.LocalDateFlexibleDeserializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import jakarta.validation.constraints.*;

import java.util.List;

public class AuthDtos {
    public record RegisterRequest(
            @NotBlank @Size(min = 3, max = 50) String username,
            @NotBlank @Email String email,
            @NotBlank @Size(max = 100) String password,
            @Size(max = 80) String displayName,
            @Size(max = 40) String phoneNumber,
            @PastOrPresent @JsonDeserialize(using = LocalDateFlexibleDeserializer.class) java.time.LocalDate birthDate,
            String gender,
            Boolean marketingOptIn,
            @NotNull Boolean agreeTerms,
            @NotNull Boolean agreePrivacy
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
