package com.aimyon.archive.aimyon_arhcive_api.dto;

import java.util.List;

public record PlacePageResponse(
        List<PlaceResponse> content,
        List<PlaceMarkerResponse> markers,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last
) {
}
