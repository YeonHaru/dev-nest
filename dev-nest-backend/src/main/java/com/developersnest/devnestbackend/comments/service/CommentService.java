package com.developersnest.devnestbackend.comments.service;

import com.developersnest.devnestbackend.auth.entity.UserEntity;
import com.developersnest.devnestbackend.auth.repository.UserRepository;
import com.developersnest.devnestbackend.comments.dto.CommentReactionResponse;
import com.developersnest.devnestbackend.comments.dto.CommentResponse;
import com.developersnest.devnestbackend.comments.dto.CommentResponse.AuthorInfo;
import com.developersnest.devnestbackend.comments.dto.CreateCommentRequest;
import com.developersnest.devnestbackend.comments.dto.UpdateCommentRequest;
import com.developersnest.devnestbackend.comments.dto.UserCommentResponse;
import com.developersnest.devnestbackend.comments.entity.CommentEntity;
import com.developersnest.devnestbackend.comments.entity.CommentReactionEntity;
import com.developersnest.devnestbackend.comments.entity.CommentReactionId;
import com.developersnest.devnestbackend.comments.repository.CommentReactionRepository;
import com.developersnest.devnestbackend.comments.repository.CommentRepository;
import com.developersnest.devnestbackend.posts.entity.PostEntity;
import com.developersnest.devnestbackend.posts.repository.PostRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class CommentService {

    private static final Comparator<CommentEntity> CREATED_AT_COMPARATOR =
            Comparator.comparing(CommentEntity::getCreatedAt);

    private final CommentRepository commentRepository;
    private final CommentReactionRepository commentReactionRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CommentResponse> listComments(Long postId, Long viewerId) {
        List<CommentEntity> comments = commentRepository.findAllByPostIdWithAuthor(postId);
        if (comments.isEmpty()) {
            return List.of();
        }

        Map<Long, Long> likeCounts = commentReactionRepository.aggregateReactionCount(
                postId,
                CommentReactionEntity.REACTION_LIKE
        ).stream().collect(Collectors.toMap(
                CommentReactionRepository.CommentReactionSummary::getCommentId,
                summary -> summary.getCount() == null ? 0L : summary.getCount(),
                Long::sum,
                LinkedHashMap::new
        ));

        Set<Long> likedIds = viewerId != null
                ? commentReactionRepository.findReactedCommentIds(
                postId,
                viewerId,
                CommentReactionEntity.REACTION_LIKE
        )
                : Set.of();

        comments.sort(CREATED_AT_COMPARATOR);
        Map<Long, List<CommentEntity>> childrenMap = new LinkedHashMap<>();
        List<CommentEntity> roots = new ArrayList<>();
        for (CommentEntity comment : comments) {
            CommentEntity parent = comment.getParent();
            if (parent == null) {
                roots.add(comment);
            } else {
                childrenMap.computeIfAbsent(parent.getId(), key -> new ArrayList<>()).add(comment);
            }
        }
        childrenMap.values().forEach(list -> list.sort(CREATED_AT_COMPARATOR));

        return roots.stream()
                .map(comment -> toResponse(comment, likeCounts, likedIds, childrenMap))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserCommentResponse> listUserComments(Long userId) {
        List<CommentEntity> comments = commentRepository.findByAuthor_IdOrderByCreatedAtDesc(userId);
        if (comments.isEmpty()) {
            return List.of();
        }

        List<Long> commentIds = comments.stream()
                .map(CommentEntity::getId)
                .filter(Objects::nonNull)
                .toList();

        Map<Long, Long> likeCounts = commentIds.isEmpty()
                ? Map.of()
                : commentReactionRepository.aggregateReactionCountByCommentIds(
                        commentIds,
                        CommentReactionEntity.REACTION_LIKE
                ).stream().collect(Collectors.toMap(
                        CommentReactionRepository.CommentReactionSummary::getCommentId,
                        summary -> summary.getCount() == null ? 0L : summary.getCount(),
                        Long::sum,
                        LinkedHashMap::new
                ));

        return comments.stream()
                .map(comment -> new UserCommentResponse(
                        comment.getId(),
                        comment.getPost() != null ? comment.getPost().getId() : null,
                        comment.getPost() != null ? comment.getPost().getTitle() : null,
                        comment.getPost() != null ? comment.getPost().getSlug() : null,
                        comment.getParent() != null ? comment.getParent().getId() : null,
                        comment.isDeleted(),
                        comment.getBodyMarkdown(),
                        comment.getBodyHtml(),
                        likeCounts.getOrDefault(comment.getId(), 0L),
                        comment.getCreatedAt(),
                        comment.getUpdatedAt()
                ))
                .toList();
    }

    @Transactional
    public CommentResponse createComment(Long postId, Long userId, CreateCommentRequest request) {
        PostEntity post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."));
        UserEntity author = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));

        CommentEntity parent = null;
        if (request.parentCommentId() != null) {
            parent = commentRepository.findByIdAndPostId(request.parentCommentId(), postId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "대댓글을 작성할 수 없습니다."));
        }

        CommentEntity entity = new CommentEntity();
        entity.setPost(post);
        entity.setAuthor(author);
        entity.setParent(parent);
        entity.setBodyMarkdown(request.body().trim());
        entity.setBodyHtml(request.body());
        entity.setDeleted(false);

        CommentEntity saved = commentRepository.save(entity);
        return toResponse(saved, Map.of(saved.getId(), 0L), Set.of(), Map.of());
    }

    @Transactional
    public CommentResponse updateComment(Long commentId, Long userId, UpdateCommentRequest request) {
        CommentEntity comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다."));

        validateAuthor(comment, userId);

        comment.setBodyMarkdown(request.body().trim());
        comment.setBodyHtml(request.body());
        comment.setDeleted(false);
        comment.setUpdatedAt(LocalDateTime.now());

        CommentEntity updated = commentRepository.save(comment);
        CommentReactionId reactionId = new CommentReactionId(
                commentId,
                userId,
                CommentReactionEntity.REACTION_LIKE
        );
        long likeCount = commentReactionRepository.countByCommentIdAndReaction(
                commentId,
                CommentReactionEntity.REACTION_LIKE
        );
        boolean liked = commentReactionRepository.existsById(reactionId);
        return toResponse(
                updated,
                Map.of(commentId, likeCount),
                liked ? Set.of(commentId) : Set.of(),
                Map.of()
        );
    }

    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        CommentEntity comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다."));
        validateAuthor(comment, userId);

        comment.setDeleted(true);
        comment.setBodyMarkdown(null);
        comment.setBodyHtml(null);
        comment.setUpdatedAt(LocalDateTime.now());
        commentRepository.save(comment);
    }

    @Transactional
    public CommentReactionResponse likeComment(Long commentId, Long userId) {
        CommentEntity comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다."));
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));

        CommentReactionId id = new CommentReactionId(
                commentId,
                userId,
                CommentReactionEntity.REACTION_LIKE
        );
        commentReactionRepository.findById(id).orElseGet(() -> {
            CommentReactionEntity reaction = new CommentReactionEntity();
            reaction.setId(id);
            reaction.setComment(comment);
            reaction.setUser(user);
            return commentReactionRepository.save(reaction);
        });

        long likeCount = commentReactionRepository.countByCommentIdAndReaction(
                commentId,
                CommentReactionEntity.REACTION_LIKE
        );
        return new CommentReactionResponse(likeCount, true);
    }

    @Transactional
    public CommentReactionResponse unlikeComment(Long commentId, Long userId) {
        CommentReactionId id = new CommentReactionId(
                commentId,
                userId,
                CommentReactionEntity.REACTION_LIKE
        );
        commentReactionRepository.findById(id).ifPresent(commentReactionRepository::delete);
        long likeCount = commentReactionRepository.countByCommentIdAndReaction(
                commentId,
                CommentReactionEntity.REACTION_LIKE
        );
        return new CommentReactionResponse(likeCount, false);
    }

    private void validateAuthor(CommentEntity comment, Long userId) {
        if (!Objects.equals(comment.getAuthor().getId(), userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "댓글 수정 권한이 없습니다.");
        }
    }

    private CommentResponse toResponse(
            CommentEntity comment,
            Map<Long, Long> likeCounts,
            Set<Long> likedIds,
            Map<Long, List<CommentEntity>> childrenMap
    ) {
        List<CommentEntity> childEntities = childrenMap.getOrDefault(comment.getId(), List.of());
        List<CommentResponse> replies = childEntities.stream()
                .map(child -> toResponse(child, likeCounts, likedIds, childrenMap))
                .toList();

        AuthorInfo author = comment.getAuthor() != null
                ? new AuthorInfo(
                comment.getAuthor().getId(),
                comment.getAuthor().getUsername(),
                comment.getAuthor().getDisplayName()
        )
                : null;

        return new CommentResponse(
                comment.getId(),
                comment.getParent() != null ? comment.getParent().getId() : null,
                comment.isDeleted(),
                comment.getBodyMarkdown(),
                comment.getBodyHtml(),
                author,
                likeCounts.getOrDefault(comment.getId(), 0L),
                likedIds.contains(comment.getId()),
                comment.getCreatedAt(),
                comment.getUpdatedAt(),
                replies
        );
    }
}
