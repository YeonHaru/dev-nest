package com.developersnest.devnestbackend.comments.dto;

import java.time.LocalDateTime;
import java.util.List;

public record CommentResponse(
        Long id,
        Long parentId,
        boolean deleted,
        String bodyMarkdown,
        String bodyHtml,
        AuthorInfo author,
        long likeCount,
        boolean liked,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<CommentResponse> replies
) {

    public record AuthorInfo(
            Long id,
            String username,
            String displayName
    ) {
    }
}
