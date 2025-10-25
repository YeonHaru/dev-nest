package com.developersnest.devnestbackend.comments.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class CommentReactionId implements Serializable {

    @Column(name = "comment_id")
    private Long commentId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "reaction")
    private String reaction;

    public CommentReactionId() {
    }

    public CommentReactionId(Long commentId, Long userId, String reaction) {
        this.commentId = commentId;
        this.userId = userId;
        this.reaction = reaction;
    }

    public Long getCommentId() {
        return commentId;
    }

    public void setCommentId(Long commentId) {
        this.commentId = commentId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getReaction() {
        return reaction;
    }

    public void setReaction(String reaction) {
        this.reaction = reaction;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CommentReactionId that)) return false;
        return Objects.equals(commentId, that.commentId)
                && Objects.equals(userId, that.userId)
                && Objects.equals(reaction, that.reaction);
    }

    @Override
    public int hashCode() {
        return Objects.hash(commentId, userId, reaction);
    }
}
