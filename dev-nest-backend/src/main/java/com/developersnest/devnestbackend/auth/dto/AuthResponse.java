package com.developersnest.devnestbackend.auth.dto;

public record AuthResponse(
        TokenResponse token,
        UserResponse user
) {
}
