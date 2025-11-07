package com.aimyon.archive.aimyon_arhcive_api.service;

import com.aimyon.archive.aimyon_arhcive_api.domain.Place;
import com.aimyon.archive.aimyon_arhcive_api.domain.Place;
import com.aimyon.archive.aimyon_arhcive_api.dto.PlaceMarkerResponse;
import com.aimyon.archive.aimyon_arhcive_api.dto.PlacePageResponse;
import com.aimyon.archive.aimyon_arhcive_api.dto.PlaceResponse;
import com.aimyon.archive.aimyon_arhcive_api.repository.PlaceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
@Profile("!mock")
@Transactional(readOnly = true)
public class PlaceService {

    private final PlaceRepository placeRepository;

    public PlaceService(PlaceRepository placeRepository) {
        this.placeRepository = placeRepository;
    }

    public PlacePageResponse getPlaces(String city, String keyword, String tag, int page, int size) {
        int pageNumber = Math.max(page, 0);
        int pageSize = Math.max(size, 1);

        List<Place> filteredEntities = placeRepository.findAll().stream()
                .filter(place -> filterByCity(place, city))
                .filter(place -> filterByKeyword(place, keyword))
                .filter(place -> filterByTag(place, tag))
                .toList();

        List<PlaceResponse> filteredResponses = filteredEntities.stream()
                .map(this::toResponse)
                .toList();

        List<PlaceMarkerResponse> markers = new ArrayList<>(filteredEntities.size());
        for (int i = 0; i < filteredEntities.size(); i++) {
            Place place = filteredEntities.get(i);
            markers.add(new PlaceMarkerResponse(
                    place.getId(),
                    place.getName(),
                    place.getLatitude(),
                    place.getLongitude(),
                    i
            ));
        }

        long totalElements = filteredResponses.size();
        int totalPages = (int) Math.ceil((double) totalElements / pageSize);

        int fromIndex = Math.min(pageNumber * pageSize, filteredResponses.size());
        int toIndex = Math.min(fromIndex + pageSize, filteredResponses.size());
        List<PlaceResponse> content = filteredResponses.subList(fromIndex, toIndex);

        return new PlacePageResponse(
                content,
                markers,
                pageNumber,
                pageSize,
                totalElements,
                totalPages,
                pageNumber == 0,
                pageNumber >= totalPages - 1 || totalPages == 0
        );
    }

    public PlaceResponse getPlace(Long id) {
        Place place = placeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Place not found"));
        return toResponse(place);
    }

    private boolean filterByCity(Place place, String city) {
        if (!StringUtils.hasText(city)) {
            return true;
        }
        return StringUtils.hasText(place.getCity()) && city.equalsIgnoreCase(place.getCity());
    }

    private boolean filterByKeyword(Place place, String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return true;
        }
        String lower = keyword.toLowerCase();
        return (StringUtils.hasText(place.getName()) && place.getName().toLowerCase().contains(lower))
                || (StringUtils.hasText(place.getDescription()) && place.getDescription().toLowerCase().contains(lower))
                || (StringUtils.hasText(place.getAddress()) && place.getAddress().toLowerCase().contains(lower));
    }

    private boolean filterByTag(Place place, String tag) {
        if (!StringUtils.hasText(tag)) {
            return true;
        }
        return place.getTags().stream()
                .anyMatch(t -> t.equalsIgnoreCase(tag));
    }

    private PlaceResponse toResponse(Place place) {
        return new PlaceResponse(
                place.getId(),
                place.getName(),
                place.getDescription(),
                place.getAddress(),
                place.getCity(),
                place.getCountry(),
                place.getLatitude(),
                place.getLongitude(),
                List.copyOf(place.getTags()),
                place.getTips(),
                place.getCreatedAt(),
                place.getUpdatedAt()
        );
    }
}
