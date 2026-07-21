package com.souvenir.trip.controller;

import com.souvenir.common.response.ApiResponse;
import com.souvenir.common.response.PageResponse;
import com.souvenir.trip.domain.TripStatus;
import com.souvenir.trip.dto.CoverPhotoRequest;
import com.souvenir.trip.dto.TripRequest;
import com.souvenir.trip.dto.TripResponse;
import com.souvenir.trip.service.TripService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/trips")
@RequiredArgsConstructor
@Tag(name = "Trips", description = "Trip management")
@SecurityRequirement(name = "bearerAuth")
public class TripController {

    private final TripService tripService;

    @GetMapping
    @Operation(summary = "Get all trips for the authenticated user")
    public ResponseEntity<ApiResponse<PageResponse<TripResponse>>> getTrips(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) TripStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                tripService.getUserTrips(userDetails.getUsername(), status, page, size)
        ));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a trip by ID")
    public ResponseEntity<ApiResponse<TripResponse>> getTrip(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                tripService.getTripById(id, userDetails.getUsername())
        ));
    }

    @PostMapping
    @Operation(summary = "Create a new trip")
    public ResponseEntity<ApiResponse<TripResponse>> createTrip(
            @Valid @RequestBody TripRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(tripService.createTrip(request, userDetails.getUsername())));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a trip")
    public ResponseEntity<ApiResponse<TripResponse>> updateTrip(
            @PathVariable UUID id,
            @Valid @RequestBody TripRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                tripService.updateTrip(id, request, userDetails.getUsername())
        ));
    }

    @PatchMapping("/{id}/cover-photo")
    @Operation(summary = "Set a photo as the trip cover")
    public ResponseEntity<ApiResponse<TripResponse>> setCoverPhoto(
            @PathVariable UUID id,
            @Valid @RequestBody CoverPhotoRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                tripService.setCoverPhoto(id, request.getPhotoId(), userDetails.getUsername())
        ));
    }

    @DeleteMapping("/{id}/cover-photo")
    @Operation(summary = "Remove the trip cover photo")
    public ResponseEntity<ApiResponse<TripResponse>> removeCoverPhoto(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                tripService.removeCoverPhoto(id, userDetails.getUsername())
        ));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a trip (soft delete)")
    public ResponseEntity<ApiResponse<Void>> deleteTrip(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        tripService.deleteTrip(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.noContent("Trip deleted successfully"));
    }
}
