package com.aimyon.archive.aimyon_arhcive_api.service;

import com.aimyon.archive.aimyon_arhcive_api.domain.NewsEvent;
import com.aimyon.archive.aimyon_arhcive_api.dto.NewsEventRequest;
import com.aimyon.archive.aimyon_arhcive_api.dto.NewsEventResponse;
import com.aimyon.archive.aimyon_arhcive_api.repository.NewsEventRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class NewsEventService {

    private final NewsEventRepository newsEventRepository;

    public NewsEventService(NewsEventRepository newsEventRepository) {
        this.newsEventRepository = newsEventRepository;
    }

    public Page<NewsEventResponse> getNewsEvents(String type, Pageable pageable) {
        Page<NewsEvent> page;
        if (StringUtils.hasText(type)) {
            page = newsEventRepository.findByType(type, pageable);
        } else {
            page = newsEventRepository.findAll(pageable);
        }
        return page.map(this::toResponse);
    }

    public NewsEventResponse getNewsEvent(Long id) {
        NewsEvent event = newsEventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "News/Event not found"));
        return toResponse(event);
    }

    @Transactional
    public NewsEventResponse createNewsEvent(NewsEventRequest request) {
        validateNewsEventRequest(request);

        NewsEvent event = NewsEvent.builder()
                .title(request.title())
                .summary(request.summary())
                .content(request.content())
                .type(request.type())
                .eventDate(request.eventDate())
                .location(request.location())
                .build();

        event.getTags().addAll(copyToMutableList(request.tags()));

        NewsEvent saved = newsEventRepository.save(event);
        return toResponse(saved);
    }

    @Transactional
    public NewsEventResponse updateNewsEvent(Long id, NewsEventRequest request) {
        validateNewsEventRequest(request);
        NewsEvent event = newsEventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "News/Event not found"));

        event.changeTitle(request.title());
        event.changeSummary(request.summary());
        event.changeContent(request.content());
        event.changeType(request.type());
        event.changeEventDate(request.eventDate());
        event.changeLocation(request.location());

        event.getTags().clear();
        event.getTags().addAll(copyToMutableList(request.tags()));

        return toResponse(event);
    }

    @Transactional
    public void deleteNewsEvent(Long id) {
        NewsEvent event = newsEventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "News/Event not found"));
        newsEventRepository.delete(event);
    }

    private NewsEventResponse toResponse(NewsEvent event) {
        return new NewsEventResponse(
                event.getId(),
                event.getTitle(),
                event.getSummary(),
                event.getContent(),
                event.getType(),
                event.getEventDate(),
                event.getLocation(),
                List.copyOf(event.getTags()),
                event.getCreatedAt(),
                event.getUpdatedAt()
        );
    }

    private List<String> copyToMutableList(List<String> source) {
        return source == null ? new ArrayList<>() : new ArrayList<>(source);
    }

    private void validateNewsEventRequest(NewsEventRequest request) {
        if (!StringUtils.hasText(request.title()) || !StringUtils.hasText(request.type())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title and type are required");
        }
    }
}
