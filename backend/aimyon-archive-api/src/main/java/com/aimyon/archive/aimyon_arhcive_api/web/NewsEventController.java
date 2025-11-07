package com.aimyon.archive.aimyon_arhcive_api.web;

import com.aimyon.archive.aimyon_arhcive_api.dto.NewsEventRequest;
import com.aimyon.archive.aimyon_arhcive_api.dto.NewsEventResponse;
import com.aimyon.archive.aimyon_arhcive_api.dto.PagedResponse;
import com.aimyon.archive.aimyon_arhcive_api.service.NewsEventService;
import org.springframework.data.domain.Page;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@Profile("!mock")
@RequestMapping("/api/news-events")
public class NewsEventController {

    private final NewsEventService newsEventService;

    public NewsEventController(NewsEventService newsEventService) {
        this.newsEventService = newsEventService;
    }

    @GetMapping
    public PagedResponse<NewsEventResponse> getNewsEvents(
            @RequestParam(required = false) String type,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<NewsEventResponse> page = newsEventService.getNewsEvents(type, pageable);
        return PagedResponse.from(page);
    }

    @GetMapping("/{id}")
    public NewsEventResponse getNewsEvent(@PathVariable Long id) {
        return newsEventService.getNewsEvent(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NewsEventResponse createNewsEvent(@RequestBody NewsEventRequest request) {
        return newsEventService.createNewsEvent(request);
    }

    @PutMapping("/{id}")
    public NewsEventResponse updateNewsEvent(@PathVariable Long id,
                                             @RequestBody NewsEventRequest request) {
        return newsEventService.updateNewsEvent(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteNewsEvent(@PathVariable Long id) {
        newsEventService.deleteNewsEvent(id);
    }
}
