package com.souvenir.stats.controller;

import com.souvenir.common.response.ApiResponse;
import com.souvenir.stats.dto.StatsResponse;
import com.souvenir.stats.dto.YearInReviewResponse;
import com.souvenir.stats.service.StatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/stats")
@RequiredArgsConstructor
@Tag(name = "Stats", description = "User travel statistics")
@SecurityRequirement(name = "bearerAuth")
public class StatsController {

    private final StatsService statsService;

    @GetMapping
    @Operation(summary = "Get travel statistics for the authenticated user")
    public ResponseEntity<ApiResponse<StatsResponse>> getStats(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                statsService.getStats(userDetails.getUsername())
        ));
    }

    @GetMapping("/year-in-review")
    @Operation(summary = "Get year-in-review summary for a given year")
    public ResponseEntity<ApiResponse<YearInReviewResponse>> getYearInReview(
            @RequestParam(required = false) Integer year,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        int resolvedYear = year != null ? year : LocalDate.now().getYear();
        return ResponseEntity.ok(ApiResponse.ok(
                statsService.getYearInReview(userDetails.getUsername(), resolvedYear)
        ));
    }
}
