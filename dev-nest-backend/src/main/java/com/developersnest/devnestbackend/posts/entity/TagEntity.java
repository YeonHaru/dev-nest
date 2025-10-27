package com.developersnest.devnestbackend.posts.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "tags")
public class TagEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tag_id")
    private Long id;

    @Column(name = "name", nullable = false, length = 80)
    private String name;

    @Column(name = "slug", nullable = false, length = 80, unique = true)
    private String slug;

    @Column(name = "description", length = 300)
    private String description;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ManyToMany(mappedBy = "tags", fetch = FetchType.LAZY)
    private Set<PostEntity> posts = new HashSet<>();

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
