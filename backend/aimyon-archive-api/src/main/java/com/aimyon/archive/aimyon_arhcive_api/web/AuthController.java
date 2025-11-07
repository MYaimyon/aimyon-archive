package com.aimyon.archive.aimyon_arhcive_api.web;

import com.aimyon.archive.aimyon_arhcive_api.dto.AuthDtos;
import com.aimyon.archive.aimyon_arhcive_api.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@Profile("local")
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthDtos.AuthResponse register(@Valid @RequestBody AuthDtos.RegisterRequest req) {
        return authService.register(req);
    }

    @PostMapping("/login")
    public AuthDtos.AuthResponse login(@Valid @RequestBody AuthDtos.LoginRequest req) {
        return authService.login(req);
    }
}

