package com.aimyon.archive.aimyon_arhcive_api.dto;

import java.math.BigDecimal;

public record PlaceMarkerResponse(
        Long id,
        String name,
        BigDecimal latitude,
        BigDecimal longitude,
        int order
) {
}
