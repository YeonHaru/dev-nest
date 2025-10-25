package com.developersnest.devnestbackend.auth.mapper;

import com.developersnest.devnestbackend.auth.dto.SignUpRequest;
import com.developersnest.devnestbackend.auth.dto.UserResponse;
import com.developersnest.devnestbackend.auth.entity.UserEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AuthMapper {

    UserResponse toUserResponse(UserEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "bio", ignore = true)
    @Mapping(target = "profileImageUrl", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "lastLoginAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    UserEntity toUserEntity(SignUpRequest request);
}
