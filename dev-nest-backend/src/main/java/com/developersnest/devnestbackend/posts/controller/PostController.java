package com.developersnest.devnestbackend.posts.controller;

import com.developersnest.devnestbackend.auth.security.UserPrincipal;
import com.developersnest.devnestbackend.posts.dto.PostDetailResponse;
import com.developersnest.devnestbackend.posts.dto.PostEngagementResponse;
import com.developersnest.devnestbackend.posts.dto.PostListResponse;
import com.developersnest.devnestbackend.posts.dto.PostSummaryResponse;
import com.developersnest.devnestbackend.posts.dto.PostWriteRequest;
import com.developersnest.devnestbackend.posts.service.PostService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping
    public PostListResponse listPosts(
            @RequestParam(name = "page", required = false) Integer page,
            @RequestParam(name = "size", required = false) Integer size,
            @RequestParam(name = "keyword", required = false) String keyword
    ) {
        return postService.getPosts(page, size, keyword);
    }

    @GetMapping("/latest")
    public List<PostSummaryResponse> latestPosts(@RequestParam(name = "limit", defaultValue = "10") int limit) {
        return postService.getLatest(limit);
    }

    @GetMapping("/slug/{slug}")
    public PostDetailResponse getBySlug(@PathVariable String slug) {
        return postService.getPostDetail(slug);
    }

    @GetMapping("/{postId}/engagement")
    public PostEngagementResponse getEngagement(
            @PathVariable Long postId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long viewerId = principal != null ? principal.getId() : null;
        return postService.getEngagement(postId, viewerId);
    }

    @PostMapping
    public ResponseEntity<PostDetailResponse> createPost(
            @Valid @RequestBody PostWriteRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long userId = principal != null ? principal.getId() : null;
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        PostDetailResponse response = postService.createPost(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{postId}")
    public PostDetailResponse updatePost(
            @PathVariable Long postId,
            @Valid @RequestBody PostWriteRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long userId = principal != null ? principal.getId() : null;
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        return postService.updatePost(postId, userId, request);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long userId = principal != null ? principal.getId() : null;
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        postService.deletePost(postId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{postId}/likes")
    public PostEngagementResponse likePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long userId = principal != null ? principal.getId() : null;
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        return postService.likePost(postId, userId);
    }

    @DeleteMapping("/{postId}/likes")
    public PostEngagementResponse unlikePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long userId = principal != null ? principal.getId() : null;
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        return postService.unlikePost(postId, userId);
    }

    @GetMapping("/me")
    public List<PostSummaryResponse> myPosts(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        return postService.getPostsByAuthor(principal.getId());
    }
}
