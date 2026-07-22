package com.souvenir.search.controller;

import com.souvenir.common.response.ApiResponse;
import com.souvenir.search.dto.SearchResponse;
import com.souvenir.search.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
@Tag(name = "Search", description = "Global cross-entity search")
@SecurityRequirement(name = "bearerAuth")
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    @Operation(summary = "Search across trips, destinations, memories and bucket list")
    public ResponseEntity<ApiResponse<SearchResponse>> search(
            @RequestParam(defaultValue = "") String q,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                searchService.search(q, userDetails.getUsername())
        ));
    }
}
