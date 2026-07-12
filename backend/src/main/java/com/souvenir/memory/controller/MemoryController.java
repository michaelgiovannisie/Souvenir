package com.souvenir.memory.controller;

import com.souvenir.common.response.ApiResponse;
import com.souvenir.memory.dto.MemoryRequest;
import com.souvenir.memory.dto.MemoryResponse;
import com.souvenir.memory.service.MemoryService;
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
@Tag(name = "Memories", description = "Trip memory and journal management")
@SecurityRequirement(name = "bearerAuth")
public class MemoryController {

    private final MemoryService memoryService;

    @GetMapping("/trips/{tripId}/memories")
    @Operation(summary = "Get all memories for a trip, ordered by date descending")
    public ResponseEntity<ApiResponse<List<MemoryResponse>>> getTripMemories(
            @PathVariable UUID tripId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                memoryService.getTripMemories(tripId, userDetails.getUsername())
        ));
    }

    @PostMapping("/trips/{tripId}/memories")
    @Operation(summary = "Create a memory for a trip")
    public ResponseEntity<ApiResponse<MemoryResponse>> createMemory(
            @PathVariable UUID tripId,
            @Valid @RequestBody MemoryRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(
                        memoryService.createMemory(tripId, request, userDetails.getUsername())
                ));
    }

    @PutMapping("/memories/{id}")
    @Operation(summary = "Update a memory")
    public ResponseEntity<ApiResponse<MemoryResponse>> updateMemory(
            @PathVariable UUID id,
            @Valid @RequestBody MemoryRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                memoryService.updateMemory(id, request, userDetails.getUsername())
        ));
    }

    @DeleteMapping("/memories/{id}")
    @Operation(summary = "Delete a memory (soft delete)")
    public ResponseEntity<ApiResponse<Void>> deleteMemory(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        memoryService.deleteMemory(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.noContent("Memory deleted successfully"));
    }
}
