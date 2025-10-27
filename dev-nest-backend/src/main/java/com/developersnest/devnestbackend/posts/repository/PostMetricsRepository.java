package com.developersnest.devnestbackend.posts.repository;

import com.developersnest.devnestbackend.posts.entity.PostMetricsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostMetricsRepository extends JpaRepository<PostMetricsEntity, Long> {

    @Query("SELECT COALESCE(SUM(m.viewsCount), 0) FROM PostMetricsEntity m WHERE m.post.author.id = :authorId")
    long sumViewsByAuthor(@Param("authorId") Long authorId);

    @Query("SELECT COALESCE(SUM(m.likesCount), 0) FROM PostMetricsEntity m WHERE m.post.author.id = :authorId")
    long sumLikesByAuthor(@Param("authorId") Long authorId);
}
