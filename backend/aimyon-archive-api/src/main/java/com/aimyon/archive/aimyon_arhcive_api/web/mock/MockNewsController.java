package com.aimyon.archive.aimyon_arhcive_api.web.mock;

import com.aimyon.archive.aimyon_arhcive_api.dto.NewsEventResponse;
import com.aimyon.archive.aimyon_arhcive_api.dto.PagedResponse;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@Profile("mock")
@RequestMapping("/api/news-events")
public class MockNewsController {

    private final List<NewsEventResponse> events = new ArrayList<>();

    public MockNewsController() {
        // Sample mock data (sorted by date desc)
        events.add(new NewsEventResponse(
                9001L,
                "New Single Announcement",
                "Aimyon teases a brand new single.",
                "Full details about the upcoming single and teaser schedule.",
                "NEWS",
                LocalDate.now().minusDays(2),
                "Tokyo",
                List.of("Announcement", "Single"),
                LocalDateTime.now().minusDays(2),
                LocalDateTime.now().minusDays(2)
        ));

        events.add(new NewsEventResponse(
                9002L,
                "TV Appearance Confirmed",
                "Variety show appearance next week.",
                "Aimyon will appear on a popular variety program.",
                "NEWS",
                LocalDate.now().minusDays(5),
                "Osaka",
                List.of("TV", "Schedule"),
                LocalDateTime.now().minusDays(5),
                LocalDateTime.now().minusDays(5)
        ));

        events.add(new NewsEventResponse(
                9003L,
                "Live House Tour",
                "Small venue live tour across Japan.",
                "Tour dates, ticket info, and cities announced.",
                "EVENT",
                LocalDate.now().minusDays(10),
                "Nationwide",
                List.of("Tour", "Live"),
                LocalDateTime.now().minusDays(10),
                LocalDateTime.now().minusDays(10)
        ));

        events.add(new NewsEventResponse(
                9004L,
                "Radio Guest Week",
                "Multiple radio guest appearances.",
                "Line-up of radio programs and topics.",
                "NEWS",
                LocalDate.now().minusDays(14),
                "Tokyo",
                List.of("Radio"),
                LocalDateTime.now().minusDays(14),
                LocalDateTime.now().minusDays(14)
        ));

        events.add(new NewsEventResponse(
                9005L,
                "Festival Performance",
                "Summer festival headline slot.",
                "Main stage headliner with special set.",
                "EVENT",
                LocalDate.now().minusDays(18),
                "Nagoya",
                List.of("Festival"),
                LocalDateTime.now().minusDays(18),
                LocalDateTime.now().minusDays(18)
        ));

        events.add(new NewsEventResponse(
                9006L,
                "Merch Pop-up",
                "Limited pop-up store open.",
                "Exclusive goods and signed items available.",
                "NEWS",
                LocalDate.now().minusDays(22),
                "Shibuya",
                List.of("Merch"),
                LocalDateTime.now().minusDays(22),
                LocalDateTime.now().minusDays(22)
        ));
    }

    @GetMapping
    public PagedResponse<NewsEventResponse> list(
            @RequestParam(name = "size", defaultValue = "6") int size
    ) {
        int s = Math.max(1, Math.min(size, events.size()));
        List<NewsEventResponse> content = events.subList(0, s);
        return new PagedResponse<>(content, 0, s, events.size(), (int) Math.ceil((double) events.size() / s));
    }
}

