package com.developersnest.devnestbackend.auth.dto;

import com.developersnest.devnestbackend.auth.entity.UserRole;
import com.fasterxml.jackson.annotation.JsonProperty;

public record UserResponse(
        @JsonProperty("id") Long id,
        @JsonProperty("username") String username,
        @JsonProperty("email") String email,
        @JsonProperty("display_name") String displayName,
        @JsonProperty("role") UserRole role
) {
}
