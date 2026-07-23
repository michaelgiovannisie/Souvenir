package com.souvenir.user.service;

import com.souvenir.auth.domain.User;
import com.souvenir.auth.dto.UserDto;
import com.souvenir.auth.repository.UserRepository;
import com.souvenir.common.exception.BadRequestException;
import com.souvenir.common.exception.ConflictException;
import com.souvenir.common.exception.ResourceNotFoundException;
import com.souvenir.photo.service.CloudinaryService;
import com.souvenir.user.dto.ChangePasswordRequest;
import com.souvenir.user.dto.UpdateProfileRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CloudinaryService cloudinaryService;

    @Transactional(readOnly = true)
    public UserDto getProfile(String email) {
        return UserDto.from(getUser(email));
    }

    @Transactional
    public UserDto updateProfile(String email, UpdateProfileRequest request) {
        User user = getUser(email);

        if (request.getDisplayName() != null && !request.getDisplayName().isBlank()) {
            user.setDisplayName(request.getDisplayName().trim());
        }

        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            String newUsername = request.getUsername().trim();
            if (!newUsername.equalsIgnoreCase(user.getUsername())) {
                if (userRepository.existsByUsername(newUsername)) {
                    throw new ConflictException("Username '" + newUsername + "' is already taken");
                }
                user.setUsername(newUsername);
            }
        }

        return UserDto.from(userRepository.save(user));
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = getUser(email);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public UserDto uploadProfilePhoto(String email, MultipartFile file) {
        User user = getUser(email);

        // Delete old photo from Cloudinary if one exists
        if (user.getProfilePhotoPublicId() != null) {
            cloudinaryService.deletePhoto(user.getProfilePhotoPublicId());
        }

        var result = cloudinaryService.uploadPhoto(file, "souvenir/avatars");
        user.setProfilePhotoUrl((String) result.get("url"));
        user.setProfilePhotoPublicId((String) result.get("public_id"));

        return UserDto.from(userRepository.save(user));
    }

    @Transactional
    public UserDto removeProfilePhoto(String email) {
        User user = getUser(email);

        if (user.getProfilePhotoPublicId() != null) {
            cloudinaryService.deletePhoto(user.getProfilePhotoPublicId());
        }

        user.setProfilePhotoUrl(null);
        user.setProfilePhotoPublicId(null);
        return UserDto.from(userRepository.save(user));
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", email));
    }
}
