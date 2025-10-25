package com.developersnest.devnestbackend.auth.service;

import com.developersnest.devnestbackend.auth.dto.AuthResponse;
import com.developersnest.devnestbackend.auth.dto.LoginRequest;
import com.developersnest.devnestbackend.auth.dto.SignUpRequest;
import com.developersnest.devnestbackend.auth.dto.TokenResponse;
import com.developersnest.devnestbackend.auth.dto.UserResponse;
import com.developersnest.devnestbackend.auth.entity.UserEntity;
import com.developersnest.devnestbackend.auth.entity.UserRole;
import com.developersnest.devnestbackend.auth.mapper.AuthMapper;
import com.developersnest.devnestbackend.auth.repository.UserRepository;
import com.developersnest.devnestbackend.auth.security.JwtTokenProvider;
import java.time.LocalDateTime;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthMapper authMapper;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public UserResponse register(SignUpRequest request) {
        String normalizedUsername = request.username().trim();
        String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByUsername(normalizedUsername)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 아이디입니다.");
        }
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다.");
        }

        UserEntity userEntity = authMapper.toUserEntity(request);
        userEntity.setPasswordHash(passwordEncoder.encode(request.password()));
        userEntity.setRole(UserRole.MEMBER);
        userEntity.setUsername(normalizedUsername);
        userEntity.setEmail(normalizedEmail);
        userEntity.setDisplayName(request.displayName().trim());
        UserEntity saved = userRepository.save(userEntity);
        return authMapper.toUserResponse(saved);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String username = request.username().trim();
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호를 다시 확인하세요."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호를 다시 확인하세요.");
        }
        user.setLastLoginAt(LocalDateTime.now());

        String accessToken = jwtTokenProvider.generateAccessToken(user);
        TokenResponse tokenResponse = TokenResponse.bearer(accessToken, jwtTokenProvider.getAccessTokenValiditySeconds());
        return new AuthResponse(tokenResponse, authMapper.toUserResponse(user));
    }

    @Transactional
    public void logout(String username) {
        if (username == null) {
            return;
        }
        userRepository.findByUsername(username.trim())
                .ifPresent(user -> user.setLastLoginAt(LocalDateTime.now()));
    }
}
