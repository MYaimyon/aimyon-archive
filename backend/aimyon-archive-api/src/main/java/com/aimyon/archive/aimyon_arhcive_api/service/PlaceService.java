package com.aimyon.archive.aimyon_arhcive_api.service;

import com.aimyon.archive.aimyon_arhcive_api.domain.Place;
import com.aimyon.archive.aimyon_arhcive_api.dto.PlaceResponse;
import com.aimyon.archive.aimyon_arhcive_api.repository.PlaceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class PlaceService {

    private final PlaceRepository placeRepository;

    public PlaceService(PlaceRepository placeRepository) {
        this.placeRepository = placeRepository;
    }

    public List<PlaceResponse> getPlaces(String city, String keyword, String tag) {
        return placeRepository.findAll().stream()
                .filter(place -> filterByCity(place, city))
                .filter(place -> filterByKeyword(place, keyword))
                .filter(place -> filterByTag(place, tag))
                .map(this::toResponse)
                .toList();
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
