package com.souvenir.packing.controller;

import com.souvenir.common.response.ApiResponse;
import com.souvenir.packing.dto.PackingItemRequest;
import com.souvenir.packing.dto.PackingItemResponse;
import com.souvenir.packing.service.PackingItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Packing List", description = "Per-trip packing list management")
@SecurityRequirement(name = "bearerAuth")
public class PackingItemController {

    private final PackingItemService packingItemService;

    @GetMapping("/api/v1/trips/{tripId}/packing")
    @Operation(summary = "Get all packing items for a trip")
    public ResponseEntity<ApiResponse<List<PackingItemResponse>>> getPackingList(
            @PathVariable UUID tripId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                packingItemService.getByTrip(tripId, userDetails.getUsername())
        ));
    }

    @PostMapping("/api/v1/trips/{tripId}/packing")
    @Operation(summary = "Add an item to the trip's packing list")
    public ResponseEntity<ApiResponse<PackingItemResponse>> addItem(
            @PathVariable UUID tripId,
            @RequestBody PackingItemRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(
                packingItemService.addItem(tripId, request, userDetails.getUsername())
        ));
    }

    @PatchMapping("/api/v1/packing/{itemId}")
    @Operation(summary = "Update a packing item (name, category, quantity, packed)")
    public ResponseEntity<ApiResponse<PackingItemResponse>> updateItem(
            @PathVariable UUID itemId,
            @RequestBody PackingItemRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                packingItemService.updateItem(itemId, request, userDetails.getUsername())
        ));
    }

    @DeleteMapping("/api/v1/packing/{itemId}")
    @Operation(summary = "Delete a packing item")
    public ResponseEntity<ApiResponse<Void>> deleteItem(
            @PathVariable UUID itemId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        packingItemService.deleteItem(itemId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.noContent("Item removed"));
    }
}
