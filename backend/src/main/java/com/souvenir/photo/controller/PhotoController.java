package com.souvenir.photo.controller;

import com.souvenir.common.response.ApiResponse;
import com.souvenir.photo.dto.PhotoResponse;
import com.souvenir.photo.service.PhotoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Photos", description = "Photo upload and management")
@SecurityRequirement(name = "bearerAuth")
public class PhotoController {

    private final PhotoService photoService;

    @GetMapping("/trips/{tripId}/photos")
    @Operation(summary = "Get all photos for a trip")
    public ResponseEntity<ApiResponse<List<PhotoResponse>>> getTripPhotos(
            @PathVariable UUID tripId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                photoService.getTripPhotos(tripId, userDetails.getUsername())
        ));
    }

    @PostMapping(value = "/trips/{tripId}/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a photo to a trip")
    public ResponseEntity<ApiResponse<PhotoResponse>> uploadPhoto(
            @PathVariable UUID tripId,
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "caption", required = false) String caption,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(
                        photoService.uploadPhoto(tripId, file, caption, userDetails.getUsername())
                ));
    }

    @DeleteMapping("/photos/{id}")
    @Operation(summary = "Delete a photo")
    public ResponseEntity<ApiResponse<Void>> deletePhoto(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        photoService.deletePhoto(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.noContent("Photo deleted successfully"));
    }
}
