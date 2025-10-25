package com.developersnest.devnestbackend.comments.dto;

public record CommentReactionResponse(
        long likeCount,
        boolean liked
) {
}
