package com.developersnest.devnestbackend.posts.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PostDetailResponse(
        Long id,
        String title,
        String slug,
        String summary,
        String content,
        List<String> tags,
        String heroImageUrl,
        Author author,
        long views,
        long likes,
        LocalDateTime publishedAt,
        LocalDateTime updatedAt
) {

    public record Author(
            Long id,
            String username,
            String displayName
    ) {
    }
}
