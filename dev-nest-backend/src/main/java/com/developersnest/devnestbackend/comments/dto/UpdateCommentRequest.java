package com.developersnest.devnestbackend.comments.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateCommentRequest(
        @NotBlank(message = "댓글 내용을 입력해주세요.")
        @Size(max = 5000, message = "댓글은 5000자 이하여야 합니다.")
        String body
) {
}
