package com.aimyon.archive.aimyon_arhcive_api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PlaceResponse(
        Long id,
        String name,
        String description,
        String address,
        String city,
        String country,
        BigDecimal latitude,
        BigDecimal longitude,
        List<String> tags,
        String tips,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
