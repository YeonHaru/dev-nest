package com.developersnest.devnestbackend.posts.mapper;

import com.developersnest.devnestbackend.auth.entity.UserEntity;
import com.developersnest.devnestbackend.posts.dto.PostDetailResponse;
import com.developersnest.devnestbackend.posts.dto.PostSummaryResponse;
import com.developersnest.devnestbackend.posts.entity.PostEntity;
import com.developersnest.devnestbackend.posts.entity.PostMetricsEntity;
import com.developersnest.devnestbackend.posts.entity.TagEntity;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PostMapper {

    @Mapping(target = "content", source = "contentMarkdown")
    @Mapping(target = "tags", expression = "java(mapTags(entity.getTags()))")
    @Mapping(target = "author", expression = "java(toAuthor(entity.getAuthor()))")
    @Mapping(target = "views", expression = "java(extractViews(entity.getMetrics()))")
    @Mapping(target = "likes", expression = "java(extractLikes(entity.getMetrics()))")
    PostDetailResponse toDetail(PostEntity entity);

    @Mapping(target = "tags", expression = "java(mapTags(entity.getTags()))")
    @Mapping(target = "authorName", expression = "java(extractAuthorName(entity.getAuthor()))")
    @Mapping(target = "views", expression = "java(extractViews(entity.getMetrics()))")
    @Mapping(target = "likes", expression = "java(extractLikes(entity.getMetrics()))")
    PostSummaryResponse toSummary(PostEntity entity);

    List<PostSummaryResponse> toSummaryList(List<PostEntity> entities);

    default PostDetailResponse.Author toAuthor(UserEntity user) {
        if (user == null) {
            return null;
        }
        return new PostDetailResponse.Author(user.getId(), user.getUsername(), user.getDisplayName());
    }

    default String extractAuthorName(UserEntity author) {
        if (author == null) {
            return null;
        }
        return author.getDisplayName();
    }

    default List<String> mapTags(Set<TagEntity> tags) {
        if (tags == null || tags.isEmpty()) {
            return Collections.emptyList();
        }
        return tags.stream()
                .map(TagEntity::getName)
                .filter(name -> name != null && !name.isBlank())
                .map(name -> name.trim())
                .distinct()
                .collect(Collectors.toList());
    }

    default long extractViews(PostMetricsEntity metrics) {
        return metrics != null ? metrics.getViewsCount() : 0L;
    }

    default long extractLikes(PostMetricsEntity metrics) {
        return metrics != null ? metrics.getLikesCount() : 0L;
    }
}
