package com.souvenir.auth.dto;

import com.souvenir.auth.domain.User;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class UserDto {
    private final UUID id;
    private final String email;
    private final String username;
    private final String displayName;
    private final String profilePhotoUrl;

    public static UserDto from(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .profilePhotoUrl(user.getProfilePhotoUrl())
                .build();
    }
}
