package com.developersnest.devnestbackend.posts.repository;

import com.developersnest.devnestbackend.posts.entity.PostMetricsEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostMetricsRepository extends JpaRepository<PostMetricsEntity, Long> {
}
