package com.developersnest.devnestbackend.comments.dto;

import java.time.LocalDateTime;

public record UserCommentResponse(
        Long id,
        Long postId,
        String postTitle,
        String postSlug,
        Long parentId,
        boolean deleted,
        String bodyMarkdown,
        String bodyHtml,
        long likeCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
