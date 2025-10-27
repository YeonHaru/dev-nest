package com.developersnest.devnestbackend.comments.controller;

import com.developersnest.devnestbackend.auth.security.UserPrincipal;
import com.developersnest.devnestbackend.comments.dto.CommentReactionResponse;
import com.developersnest.devnestbackend.comments.dto.CommentResponse;
import com.developersnest.devnestbackend.comments.dto.CreateCommentRequest;
import com.developersnest.devnestbackend.comments.dto.UpdateCommentRequest;
import com.developersnest.devnestbackend.comments.dto.UserCommentListResponse;
import com.developersnest.devnestbackend.comments.service.CommentService;
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
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/posts/{postId}/comments")
    public List<CommentResponse> listComments(
            @PathVariable Long postId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long viewerId = principal != null ? principal.getId() : null;
        return commentService.listComments(postId, viewerId);
    }

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long userId = requireAuthenticated(principal);
        CommentResponse response = commentService.createComment(postId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/comments/{commentId}")
    public CommentResponse updateComment(
            @PathVariable Long commentId,
            @Valid @RequestBody UpdateCommentRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long userId = requireAuthenticated(principal);
        return commentService.updateComment(commentId, userId, request);
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long userId = requireAuthenticated(principal);
        commentService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/comments/{commentId}/likes")
    public CommentReactionResponse likeComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long userId = requireAuthenticated(principal);
        return commentService.likeComment(commentId, userId);
    }

    @DeleteMapping("/comments/{commentId}/likes")
    public CommentReactionResponse unlikeComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long userId = requireAuthenticated(principal);
        return commentService.unlikeComment(commentId, userId);
    }

    @GetMapping("/comments/me")
    public UserCommentListResponse myComments(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(name = "page", required = false) Integer page,
            @RequestParam(name = "size", required = false) Integer size
    ) {
        Long userId = requireAuthenticated(principal);
        return commentService.listUserComments(userId, page, size);
    }

    private Long requireAuthenticated(UserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        return principal.getId();
    }
}
