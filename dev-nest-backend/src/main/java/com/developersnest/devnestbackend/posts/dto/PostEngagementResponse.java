package com.developersnest.devnestbackend.posts.dto;

public record PostEngagementResponse(
        long views,
        long likes,
        boolean liked
) {
}
