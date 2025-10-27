package com.developersnest.devnestbackend.comments.dto;

import java.util.List;

public record UserCommentListResponse(
        List<UserCommentResponse> items,
        long totalElements,
        int totalPages,
        int page,
        int size
) {
}
