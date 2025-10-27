package com.developersnest.devnestbackend.posts.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PostSummaryResponse(
        Long id,
        String title,
        String slug,
        String summary,
        List<String> tags,
        String authorName,
        long views,
        long likes,
        LocalDateTime publishedAt,
        LocalDateTime updatedAt
) {
}
