package com.aimyon.archive.aimyon_arhcive_api.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tracks")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class Track {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "album_id", nullable = false)
    private Album album;

    @Column(name = "title_ja", nullable = false)
    private String titleJa;

    @Column(name = "title_ko")
    private String titleKo;

    @Column(name = "track_no")
    private Integer trackNo;

    @Column(name = "duration")
    private String duration;

    @Column(name = "lyrics_summary", columnDefinition = "TEXT")
    private String lyricsSummary;

    @Column(name = "mv_url")
    private String mvUrl;

    @OneToMany(mappedBy = "track", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TrackStory> stories = new ArrayList<>();

    public void assignAlbum(Album album) {
        this.album = album;
    }

    public void addStory(TrackStory story) {
        stories.add(story);
        story.assignTrack(this);
    }
}
