package com.developersnest.devnestbackend.comments.repository;

import com.developersnest.devnestbackend.comments.entity.CommentReactionEntity;
import com.developersnest.devnestbackend.comments.entity.CommentReactionId;
import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommentReactionRepository extends JpaRepository<CommentReactionEntity, CommentReactionId> {

    @Query("""
            SELECT COUNT(r)
            FROM CommentReactionEntity r
            WHERE r.comment.id = :commentId
              AND r.id.reaction = :reaction
            """)
    long countByCommentIdAndReaction(@Param("commentId") Long commentId, @Param("reaction") String reaction);

    @Query("""
            SELECT r.id.commentId AS commentId, COUNT(r) AS count
            FROM CommentReactionEntity r
            WHERE r.comment.post.id = :postId AND r.id.reaction = :reaction
            GROUP BY r.id.commentId
            """)
    List<CommentReactionSummary> aggregateReactionCount(
            @Param("postId") Long postId,
            @Param("reaction") String reaction
    );

    @Query("""
            SELECT r.id.commentId
            FROM CommentReactionEntity r
            WHERE r.comment.post.id = :postId
              AND r.user.id = :userId
              AND r.id.reaction = :reaction
            """)
    Set<Long> findReactedCommentIds(
            @Param("postId") Long postId,
            @Param("userId") Long userId,
            @Param("reaction") String reaction
    );

    interface CommentReactionSummary {
        Long getCommentId();

        Long getCount();
    }
}
