package com.developersnest.devnestbackend.posts.repository;

import com.developersnest.devnestbackend.posts.entity.TagEntity;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TagRepository extends JpaRepository<TagEntity, Long> {

    Optional<TagEntity> findBySlug(String slug);

    List<TagEntity> findBySlugIn(Collection<String> slugs);
}
