package com.souvenir.user.controller;

import com.souvenir.auth.dto.UserDto;
import com.souvenir.common.response.ApiResponse;
import com.souvenir.user.dto.ChangePasswordRequest;
import com.souvenir.user.dto.UpdateProfileRequest;
import com.souvenir.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/users/me")
@RequiredArgsConstructor
@Tag(name = "Profile", description = "Current user profile management")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<UserDto>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                userService.getProfile(userDetails.getUsername())
        ));
    }

    @PatchMapping
    @Operation(summary = "Update display name or username")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                userService.updateProfile(userDetails.getUsername(), request)
        ));
    }

    @PatchMapping("/password")
    @Operation(summary = "Change password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        userService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.noContent("Password changed successfully"));
    }

    @PostMapping(value = "/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload or replace profile photo")
    public ResponseEntity<ApiResponse<UserDto>> uploadPhoto(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                userService.uploadProfilePhoto(userDetails.getUsername(), file)
        ));
    }

    @DeleteMapping("/photo")
    @Operation(summary = "Remove profile photo")
    public ResponseEntity<ApiResponse<UserDto>> removePhoto(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                userService.removeProfilePhoto(userDetails.getUsername())
        ));
    }
}
