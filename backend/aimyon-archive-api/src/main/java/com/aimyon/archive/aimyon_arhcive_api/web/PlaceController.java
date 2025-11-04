package com.aimyon.archive.aimyon_arhcive_api.web;

import com.aimyon.archive.aimyon_arhcive_api.dto.PlacePageResponse;
import com.aimyon.archive.aimyon_arhcive_api.dto.PlaceResponse;
import com.aimyon.archive.aimyon_arhcive_api.service.PlaceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/places")
public class PlaceController {

    private final PlaceService placeService;

    public PlaceController(PlaceService placeService) {
        this.placeService = placeService;
    }

    @GetMapping
    public PlacePageResponse getPlaces(@RequestParam(required = false) String city,
                                       @RequestParam(required = false) String keyword,
                                       @RequestParam(required = false) String tag,
                                       @RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "6") int size) {
        return placeService.getPlaces(city, keyword, tag, page, size);
    }

    @GetMapping("/{id}")
    public PlaceResponse getPlace(@PathVariable Long id) {
        return placeService.getPlace(id);
    }
}
