package com.souvenir.bucketlist.controller;

import com.souvenir.bucketlist.dto.BucketListRequest;
import com.souvenir.bucketlist.dto.BucketListResponse;
import com.souvenir.bucketlist.service.BucketListService;
import com.souvenir.common.response.ApiResponse;
import com.souvenir.common.response.PageResponse;
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
@RequestMapping("/api/v1/bucket-list")
@RequiredArgsConstructor
@Tag(name = "Bucket List", description = "Travel bucket list management")
@SecurityRequirement(name = "bearerAuth")
public class BucketListController {

    private final BucketListService bucketListService;

    @GetMapping
    @Operation(summary = "Get user's bucket list")
    public ResponseEntity<ApiResponse<PageResponse<BucketListResponse>>> getBucketList(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                bucketListService.getUserBucketList(userDetails.getUsername(), page, size)
        ));
    }

    @PostMapping
    @Operation(summary = "Add a destination to bucket list")
    public ResponseEntity<ApiResponse<BucketListResponse>> addItem(
            @Valid @RequestBody BucketListRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(bucketListService.addItem(request, userDetails.getUsername())));
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Toggle completion status of a bucket list item")
    public ResponseEntity<ApiResponse<BucketListResponse>> toggleComplete(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                bucketListService.toggleComplete(id, userDetails.getUsername())
        ));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a bucket list item")
    public ResponseEntity<ApiResponse<Void>> deleteItem(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        bucketListService.deleteItem(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.noContent("Item removed from bucket list"));
    }
}
