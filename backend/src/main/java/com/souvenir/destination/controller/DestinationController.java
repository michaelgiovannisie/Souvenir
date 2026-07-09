package com.souvenir.destination.controller;

import com.souvenir.common.response.ApiResponse;
import com.souvenir.destination.dto.DestinationRequest;
import com.souvenir.destination.dto.DestinationResponse;
import com.souvenir.destination.service.DestinationService;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Destinations", description = "Destination management within trips")
@SecurityRequirement(name = "bearerAuth")
public class DestinationController {

    private final DestinationService destinationService;

    @GetMapping("/trips/{tripId}/destinations")
    @Operation(summary = "Get all destinations for a trip")
    public ResponseEntity<ApiResponse<List<DestinationResponse>>> getDestinations(
            @PathVariable UUID tripId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                destinationService.getTripDestinations(tripId, userDetails.getUsername())
        ));
    }

    @PostMapping("/trips/{tripId}/destinations")
    @Operation(summary = "Add a destination to a trip")
    public ResponseEntity<ApiResponse<DestinationResponse>> addDestination(
            @PathVariable UUID tripId,
            @Valid @RequestBody DestinationRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(
                        destinationService.addDestination(tripId, request, userDetails.getUsername())
                ));
    }

    @PutMapping("/destinations/{id}")
    @Operation(summary = "Update a destination")
    public ResponseEntity<ApiResponse<DestinationResponse>> updateDestination(
            @PathVariable UUID id,
            @Valid @RequestBody DestinationRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                destinationService.updateDestination(id, request, userDetails.getUsername())
        ));
    }

    @DeleteMapping("/destinations/{id}")
    @Operation(summary = "Delete a destination")
    public ResponseEntity<ApiResponse<Void>> deleteDestination(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        destinationService.deleteDestination(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.noContent("Destination deleted successfully"));
    }
}
