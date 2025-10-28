package com.aimyon.archive.aimyon_arhcive_api.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "news_events")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class NewsEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "type", nullable = false, length = 20)
    private String type;

    @Column(name = "event_date")
    private LocalDate eventDate;

    @Column(name = "location")
    private String location;

    @ElementCollection
    @CollectionTable(name = "news_event_tags", joinColumns = @JoinColumn(name = "news_event_id"))
    @Column(name = "tag")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void changeTitle(String title) {
        this.title = title;
    }

    public void changeSummary(String summary) {
        this.summary = summary;
    }

    public void changeContent(String content) {
        this.content = content;
    }

    public void changeType(String type) {
        this.type = type;
    }

    public void changeEventDate(LocalDate eventDate) {
        this.eventDate = eventDate;
    }

    public void changeLocation(String location) {
        this.location = location;
    }
}
