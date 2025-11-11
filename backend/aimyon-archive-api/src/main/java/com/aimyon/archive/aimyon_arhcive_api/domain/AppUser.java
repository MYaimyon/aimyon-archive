package com.aimyon.archive.aimyon_arhcive_api.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "app_users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "email", nullable = false, unique = true, length = 120)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 200)
    private String passwordHash;

    @Column(name = "display_name", length = 80)
    private String displayName;

    @Column(name = "phone_number", length = 40)
    private String phoneNumber;

    @Column(name = "gender", length = 20)
    private String gender;

    @Column(name = "marketing_opt_in")
    private Boolean marketingOptIn;

    @Column(name = "terms_agreed")
    private Boolean termsAgreed;

    @Column(name = "privacy_agreed")
    private Boolean privacyAgreed;

    @Column(name = "birth_date")
    private java.time.LocalDate birthDate;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "app_user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    @Builder.Default
    private List<String> roles = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
