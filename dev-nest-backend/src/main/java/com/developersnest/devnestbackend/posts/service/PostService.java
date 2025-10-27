package com.developersnest.devnestbackend.posts.service;

import com.developersnest.devnestbackend.auth.entity.UserEntity;
import com.developersnest.devnestbackend.auth.repository.UserRepository;
import com.developersnest.devnestbackend.posts.dto.PostDetailResponse;
import com.developersnest.devnestbackend.posts.dto.PostEngagementResponse;
import com.developersnest.devnestbackend.posts.dto.PostListResponse;
import com.developersnest.devnestbackend.posts.dto.PostSummaryResponse;
import com.developersnest.devnestbackend.posts.dto.PostWriteRequest;
import com.developersnest.devnestbackend.posts.entity.PostEntity;
import com.developersnest.devnestbackend.posts.entity.PostLikeEntity;
import com.developersnest.devnestbackend.posts.entity.PostLikeId;
import com.developersnest.devnestbackend.posts.entity.PostMetricsEntity;
import com.developersnest.devnestbackend.posts.entity.TagEntity;
import com.developersnest.devnestbackend.posts.mapper.PostMapper;
import com.developersnest.devnestbackend.posts.repository.PostLikeRepository;
import com.developersnest.devnestbackend.posts.repository.PostMetricsRepository;
import com.developersnest.devnestbackend.posts.repository.PostRepository;
import com.developersnest.devnestbackend.posts.repository.TagRepository;
import java.text.Normalizer;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PostService {

    private static final int MAX_PAGE_SIZE = 50;
    private static final int DEFAULT_PAGE_SIZE = 10;

    private final PostRepository postRepository;
    private final TagRepository tagRepository;
    private final PostLikeRepository postLikeRepository;
    private final PostMetricsRepository postMetricsRepository;
    private final UserRepository userRepository;
    private final PostMapper postMapper;

    public PostService(
            PostRepository postRepository,
            TagRepository tagRepository,
            PostLikeRepository postLikeRepository,
            PostMetricsRepository postMetricsRepository,
            UserRepository userRepository,
            PostMapper postMapper
    ) {
        this.postRepository = postRepository;
        this.tagRepository = tagRepository;
        this.postLikeRepository = postLikeRepository;
        this.postMetricsRepository = postMetricsRepository;
        this.userRepository = userRepository;
        this.postMapper = postMapper;
    }

    @Transactional
    public PostDetailResponse getPostDetail(String slug) {
        PostEntity post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "포스트를 찾을 수 없습니다."));
        PostMetricsEntity metrics = ensureMetrics(post);
        metrics.incrementViews();
        return postMapper.toDetail(post);
    }

    @Transactional
    public PostDetailResponse createPost(Long authorId, PostWriteRequest request) {
        UserEntity author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));

        PostEntity post = new PostEntity();
        post.setAuthor(author);
        applyWriteRequest(post, request, true);

        PostEntity saved = postRepository.save(post);
        ensureMetrics(saved);
        return postMapper.toDetail(saved);
    }

    @Transactional
    public PostDetailResponse updatePost(Long postId, Long authorId, PostWriteRequest request) {
        PostEntity post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "포스트를 찾을 수 없습니다."));
        if (!Objects.equals(post.getAuthor().getId(), authorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "포스트 수정 권한이 없습니다.");
        }

        applyWriteRequest(post, request, false);
        PostEntity saved = postRepository.save(post);
        return postMapper.toDetail(saved);
    }

    @Transactional
    public void deletePost(Long postId, Long authorId) {
        PostEntity post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "포스트를 찾을 수 없습니다."));
        if (!Objects.equals(post.getAuthor().getId(), authorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "포스트 삭제 권한이 없습니다.");
        }
        postRepository.delete(post);
    }

    @Transactional
    public PostEngagementResponse likePost(Long postId, Long userId) {
        PostEntity post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "포스트를 찾을 수 없습니다."));
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));

        PostMetricsEntity metrics = ensureMetrics(post);
        PostLikeId id = new PostLikeId(postId, userId);
        if (!postLikeRepository.existsById(id)) {
            PostLikeEntity like = new PostLikeEntity();
            like.setId(id);
            like.setPost(post);
            like.setUser(user);
            postLikeRepository.save(like);
            metrics.incrementLikes();
        }

        return new PostEngagementResponse(metrics.getViewsCount(), metrics.getLikesCount(), true);
    }

    @Transactional
    public PostEngagementResponse unlikePost(Long postId, Long userId) {
        PostEntity post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "포스트를 찾을 수 없습니다."));
        PostMetricsEntity metrics = ensureMetrics(post);
        PostLikeId id = new PostLikeId(postId, userId);
        postLikeRepository.findById(id).ifPresent(like -> {
            postLikeRepository.delete(like);
            metrics.decrementLikes();
        });
        return new PostEngagementResponse(metrics.getViewsCount(), metrics.getLikesCount(), false);
    }

    @Transactional(readOnly = true)
    public PostEngagementResponse getEngagement(Long postId, Long viewerId) {
        PostEntity post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "포스트를 찾을 수 없습니다."));
        PostMetricsEntity metrics = post.getMetrics();
        long views = metrics != null ? metrics.getViewsCount() : 0L;
        long likes = metrics != null ? metrics.getLikesCount() : 0L;
        boolean liked = viewerId != null && postLikeRepository.existsById(new PostLikeId(postId, viewerId));
        return new PostEngagementResponse(views, likes, liked);
    }

    @Transactional(readOnly = true)
    public List<PostSummaryResponse> getLatest(int limit) {
        int size = Math.min(Math.max(limit, 1), 50);
        Pageable pageable = PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "publishedAt", "id"));
        Page<PostEntity> page = postRepository.findAll(pageable);
        return postMapper.toSummaryList(page.getContent());
    }

    @Transactional(readOnly = true)
    public PostListResponse getPosts(Integer page, Integer size, String keyword) {
        int pageIndex = page != null && page >= 0 ? page : 0;
        int pageSize = size != null && size > 0 ? Math.min(size, MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE;
        Pageable pageable = PageRequest.of(pageIndex, pageSize, Sort.by(Sort.Direction.DESC, "publishedAt", "id"));
        String normalizedKeyword = StringUtils.hasText(keyword) ? keyword.trim() : null;
        Page<PostEntity> result = postRepository.search(normalizedKeyword, pageable);
        List<PostSummaryResponse> items = postMapper.toSummaryList(result.getContent());
        return new PostListResponse(items, result.getTotalElements(), result.getTotalPages(), result.getNumber(), result.getSize());
    }

    @Transactional(readOnly = true)
    public List<PostSummaryResponse> getPostsByAuthor(Long authorId) {
        List<PostEntity> posts = postRepository.findByAuthor_IdOrderByUpdatedAtDesc(authorId);
        return postMapper.toSummaryList(posts);
    }

    private void applyWriteRequest(PostEntity post, PostWriteRequest request, boolean isNew) {
        String title = request.title().trim();
        post.setTitle(title);
        if (isNew || !StringUtils.hasText(post.getSlug())) {
            String slug = generateUniqueSlug(title, isNew ? null : post.getId());
            post.setSlug(slug);
        }

        post.setSummary(normalizeNullable(request.summary()));
        post.setContentMarkdown(request.content());
        post.setContentHtml(request.content());
        post.setHeroImageUrl(normalizeNullable(request.heroImageUrl()));

        post.clearTags();
        resolveTags(request.tags()).forEach(post::addTag);

        if (isNew || post.getMetrics() == null) {
            PostMetricsEntity metrics = new PostMetricsEntity();
            metrics.setViewsCount(0);
            metrics.setLikesCount(0);
            post.setMetrics(metrics);
        }
    }

    private Set<TagEntity> resolveTags(List<String> tags) {
        if (tags == null || tags.isEmpty()) {
            return Collections.emptySet();
        }

        Map<String, String> slugToDisplayName = new LinkedHashMap<>();
        for (String rawTag : tags) {
            if (!StringUtils.hasText(rawTag)) {
                continue;
            }
            String displayName = rawTag.trim();
            String slug = toSlug(displayName);
            if (!slug.isBlank()) {
                slugToDisplayName.putIfAbsent(slug, displayName);
            }
        }

        if (slugToDisplayName.isEmpty()) {
            return Collections.emptySet();
        }

        List<TagEntity> existing = tagRepository.findBySlugIn(slugToDisplayName.keySet());
        Map<String, TagEntity> existingMap = existing.stream()
                .collect(Collectors.toMap(TagEntity::getSlug, tag -> tag));

        Set<TagEntity> resolved = new LinkedHashSet<>();
        slugToDisplayName.forEach((slug, displayName) -> {
            TagEntity tag = existingMap.get(slug);
            if (tag == null) {
                tag = new TagEntity();
                tag.setSlug(slug);
                tag.setName(displayName);
            }
            resolved.add(tag);
        });
        return resolved;
    }

    private PostMetricsEntity ensureMetrics(PostEntity post) {
        PostMetricsEntity metrics = post.getMetrics();
        if (metrics == null) {
            metrics = new PostMetricsEntity();
            metrics.setViewsCount(0);
            metrics.setLikesCount(0);
            post.setMetrics(metrics);
            metrics.setId(post.getId());
            postMetricsRepository.save(metrics);
        }
        return metrics;
    }

    private String generateUniqueSlug(String title, Long currentPostId) {
        String baseSlug = toSlug(title);
        if (baseSlug.isBlank()) {
            baseSlug = "post";
        }

        String candidate = baseSlug;
        int suffix = 1;
        while (true) {
            Optional<PostEntity> existing = postRepository.findBySlug(candidate);
            if (existing.isEmpty() || Objects.equals(existing.get().getId(), currentPostId)) {
                return candidate;
            }
            candidate = baseSlug + "-" + suffix++;
        }
    }

    private String toSlug(String input) {
        if (!StringUtils.hasText(input)) {
            return "";
        }
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return normalized
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }

    private String normalizeNullable(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
