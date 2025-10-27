package com.developersnest.devnestbackend.posts.entity;

import com.developersnest.devnestbackend.auth.entity.UserEntity;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "post_likes")
public class PostLikeEntity {

    @EmbeddedId
    private PostLikeId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("postId")
    @JoinColumn(name = "post_id")
    private PostEntity post;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Column(name = "liked_at", nullable = false)
    private LocalDateTime likedAt;

    @PrePersist
    void onPersist() {
        if (this.likedAt == null) {
            this.likedAt = LocalDateTime.now();
        }
    }
}
