package com.developersnest.devnestbackend.comments.repository;

import com.developersnest.devnestbackend.comments.entity.CommentEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.EntityGraph;

public interface CommentRepository extends JpaRepository<CommentEntity, Long> {

    @Query("""
            SELECT DISTINCT c FROM CommentEntity c
            LEFT JOIN FETCH c.author
            LEFT JOIN FETCH c.post
            LEFT JOIN FETCH c.parent
            WHERE c.post.id = :postId
            ORDER BY c.createdAt ASC
            """)
    List<CommentEntity> findAllByPostIdWithAuthor(@Param("postId") Long postId);

    Optional<CommentEntity> findByIdAndPostId(Long commentId, Long postId);

    @EntityGraph(attributePaths = {"post"})
    List<CommentEntity> findByAuthor_IdOrderByCreatedAtDesc(Long authorId);
}
