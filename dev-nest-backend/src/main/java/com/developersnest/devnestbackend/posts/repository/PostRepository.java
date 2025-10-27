package com.developersnest.devnestbackend.posts.repository;

import com.developersnest.devnestbackend.posts.entity.PostEntity;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.EntityGraph;

public interface PostRepository extends JpaRepository<PostEntity, Long> {

    Optional<PostEntity> findBySlug(String slug);

    boolean existsBySlug(String slug);

    @Query("""
            SELECT p FROM PostEntity p
            WHERE (:keyword IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.summary) LIKE LOWER(CONCAT('%', :keyword, '%')))
            """)
    Page<PostEntity> search(@Param("keyword") String keyword, Pageable pageable);

    @EntityGraph(attributePaths = {"metrics", "tags"})
    java.util.List<PostEntity> findByAuthor_IdOrderByUpdatedAtDesc(Long authorId);
}
