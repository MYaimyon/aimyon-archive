package com.aimyon.archive.aimyon_arhcive_api.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Component
public class JwtUtil {

    private final SecretKey key;
    private final long expirationMillis;

    public JwtUtil(
            @Value("${app.jwt.secret:change-me-secret-change-me-secret}") String secret,
            @Value("${app.jwt.expirationMillis:604800000}") long expirationMillis
    ) {
        // Build key from provided secret
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.expirationMillis = expirationMillis;
    }

    public String generate(Long userId, String username, List<String> roles) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMillis);
        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .setIssuedAt(now)
                .setExpiration(exp)
                .addClaims(Map.of("uname", username, "roles", roles))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}

