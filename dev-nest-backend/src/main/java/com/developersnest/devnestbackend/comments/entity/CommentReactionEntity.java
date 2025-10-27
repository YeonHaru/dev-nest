package com.developersnest.devnestbackend.comments.entity;

import com.developersnest.devnestbackend.auth.entity.UserEntity;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "comment_reactions")
public class CommentReactionEntity {

    public static final String REACTION_LIKE = "like";

    @EmbeddedId
    private CommentReactionId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("commentId")
    @JoinColumn(name = "comment_id")
    private CommentEntity comment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Column(name = "reacted_at", nullable = false)
    private LocalDateTime reactedAt = LocalDateTime.now();
}
