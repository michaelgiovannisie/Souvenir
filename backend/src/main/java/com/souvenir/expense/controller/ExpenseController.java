package com.souvenir.expense.controller;

import com.souvenir.common.response.ApiResponse;
import com.souvenir.expense.dto.ExpenseRequest;
import com.souvenir.expense.dto.ExpenseResponse;
import com.souvenir.expense.service.ExpenseService;
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
@Tag(name = "Expenses", description = "Per-trip expense tracking")
@SecurityRequirement(name = "bearerAuth")
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping("/api/v1/trips/{tripId}/expenses")
    @Operation(summary = "Get all expenses for a trip")
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getExpenses(
            @PathVariable UUID tripId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                expenseService.getByTrip(tripId, userDetails.getUsername())
        ));
    }

    @PostMapping("/api/v1/trips/{tripId}/expenses")
    @Operation(summary = "Add an expense to a trip")
    public ResponseEntity<ApiResponse<ExpenseResponse>> addExpense(
            @PathVariable UUID tripId,
            @Valid @RequestBody ExpenseRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(
                expenseService.addExpense(tripId, request, userDetails.getUsername())
        ));
    }

    @PatchMapping("/api/v1/expenses/{expenseId}")
    @Operation(summary = "Update an expense")
    public ResponseEntity<ApiResponse<ExpenseResponse>> updateExpense(
            @PathVariable UUID expenseId,
            @Valid @RequestBody ExpenseRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                expenseService.updateExpense(expenseId, request, userDetails.getUsername())
        ));
    }

    @DeleteMapping("/api/v1/expenses/{expenseId}")
    @Operation(summary = "Delete an expense")
    public ResponseEntity<ApiResponse<Void>> deleteExpense(
            @PathVariable UUID expenseId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        expenseService.deleteExpense(expenseId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.noContent("Expense deleted"));
    }
}
