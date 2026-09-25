package com.souvenir.memento.controller;

import com.souvenir.common.response.ApiResponse;
import com.souvenir.memento.dto.MementoRequest;
import com.souvenir.memento.dto.MementoResponse;
import com.souvenir.memento.service.TripMementoService;
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
@RequiredArgsConstructor
@Tag(name = "Mementos", description = "People met and souvenirs collected per trip")
@SecurityRequirement(name = "bearerAuth")
public class TripMementoController {

    private final TripMementoService mementoService;

    @GetMapping("/api/v1/trips/{tripId}/mementos")
    @Operation(summary = "List all mementos for a trip")
    public ResponseEntity<ApiResponse<List<MementoResponse>>> getMementos(
            @PathVariable UUID tripId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                mementoService.getMementos(tripId, userDetails.getUsername())
        ));
    }

    @PostMapping("/api/v1/trips/{tripId}/mementos")
    @Operation(summary = "Add a memento to a trip")
    public ResponseEntity<ApiResponse<MementoResponse>> createMemento(
            @PathVariable UUID tripId,
            @Valid @RequestBody MementoRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                mementoService.createMemento(tripId, request, userDetails.getUsername())
        ));
    }

    @PutMapping("/api/v1/mementos/{id}")
    @Operation(summary = "Update a memento")
    public ResponseEntity<ApiResponse<MementoResponse>> updateMemento(
            @PathVariable UUID id,
            @Valid @RequestBody MementoRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                mementoService.updateMemento(id, request, userDetails.getUsername())
        ));
    }

    @DeleteMapping("/api/v1/mementos/{id}")
    @Operation(summary = "Delete a memento")
    public ResponseEntity<Void> deleteMemento(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        mementoService.deleteMemento(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
