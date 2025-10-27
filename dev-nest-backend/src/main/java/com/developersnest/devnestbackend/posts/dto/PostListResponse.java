package com.developersnest.devnestbackend.posts.dto;

import java.util.List;

public record PostListResponse(
        List<PostSummaryResponse> items,
        long totalElements,
        int totalPages,
        int page,
        int size
) {
}
