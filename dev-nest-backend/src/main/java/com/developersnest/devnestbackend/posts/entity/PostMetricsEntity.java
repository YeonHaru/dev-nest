package com.developersnest.devnestbackend.posts.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "post_metrics")
public class PostMetricsEntity {

    @Id
    @Column(name = "post_id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "post_id")
    private PostEntity post;

    @Column(name = "views_count", nullable = false)
    private long viewsCount;

    @Column(name = "likes_count", nullable = false)
    private long likesCount;

    @Column(name = "last_view_at")
    private LocalDateTime lastViewAt;

    @Column(name = "last_like_at")
    private LocalDateTime lastLikeAt;

    public void incrementViews() {
        this.viewsCount++;
        this.lastViewAt = LocalDateTime.now();
    }

    public void incrementLikes() {
        this.likesCount++;
        this.lastLikeAt = LocalDateTime.now();
    }

    public void decrementLikes() {
        if (this.likesCount > 0) {
            this.likesCount--;
        }
        this.lastLikeAt = LocalDateTime.now();
    }
}
