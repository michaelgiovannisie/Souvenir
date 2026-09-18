package com.souvenir.budget.controller;

import com.souvenir.budget.dto.BudgetRequest;
import com.souvenir.budget.dto.BudgetResponse;
import com.souvenir.budget.service.TripBudgetService;
import com.souvenir.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/trips/{tripId}/budgets")
@RequiredArgsConstructor
@Tag(name = "Budgets", description = "Per-trip spending budgets by category")
@SecurityRequirement(name = "bearerAuth")
public class TripBudgetController {

    private final TripBudgetService budgetService;

    @GetMapping
    @Operation(summary = "Get all budget targets for a trip")
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getBudgets(
            @PathVariable UUID tripId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                budgetService.getBudgets(tripId, userDetails.getUsername())
        ));
    }

    @PutMapping
    @Operation(summary = "Save (replace) all budget targets for a trip")
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> saveBudgets(
            @PathVariable UUID tripId,
            @Valid @RequestBody BudgetRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                budgetService.saveBudgets(tripId, request, userDetails.getUsername())
        ));
    }
}
