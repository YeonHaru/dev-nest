package com.developersnest.devnestbackend.posts.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record PostWriteRequest(
        @NotBlank(message = "제목을 입력해주세요.")
        @Size(max = 200, message = "제목은 200자 이하여야 합니다.")
        String title,
        @NotBlank(message = "본문을 입력해주세요.")
        @Size(max = 20000, message = "본문은 20000자 이하여야 합니다.")
        String content,
        @Size(max = 500, message = "요약은 500자 이하여야 합니다.")
        String summary,
        @Size(max = 400, message = "대표 이미지는 400자 이내의 URL이어야 합니다.")
        String heroImageUrl,
        @Size(max = 10, message = "태그는 최대 10개까지 지정할 수 있습니다.")
        List<
                @NotBlank(message = "태그는 비어 있을 수 없습니다.")
                @Size(max = 40, message = "태그는 40자 이하여야 합니다.")
                String> tags
) {
}
