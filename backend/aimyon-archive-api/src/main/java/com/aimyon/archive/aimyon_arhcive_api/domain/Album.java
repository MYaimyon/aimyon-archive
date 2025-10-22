package com.aimyon.archive.aimyon_arhcive_api.domain;

import jakarta.persistence.*;
import jakarta.persistence.OrderBy;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "albums")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class Album {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title_ja", nullable = false)
    private String titleJa;

    @Column(name = "title_ko")
    private String titleKo;

    @Column(name = "album_type", nullable = false)
    private String type; // TODO: Enum으로 승격 (ALBUM/SINGLE/EP 등)

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "cover_url")
    private String coverUrl;

    @ElementCollection
    @CollectionTable(name = "album_tags", joinColumns = @JoinColumn(name = "album_id"))
    @Column(name = "tag")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @OneToMany(mappedBy = "album", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("trackNo ASC")
    @Builder.Default
    private List<Track> tracks = new ArrayList<>();

    public void addTrack(Track track) {
        tracks.add(track);
        track.assignAlbum(this);
    }
}
