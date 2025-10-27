package com.developersnest.devnestbackend.posts.repository;

import com.developersnest.devnestbackend.posts.entity.PostLikeEntity;
import com.developersnest.devnestbackend.posts.entity.PostLikeId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostLikeRepository extends JpaRepository<PostLikeEntity, PostLikeId> {

    long countByPost_Id(Long postId);
}
