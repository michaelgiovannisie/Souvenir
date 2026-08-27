package com.souvenir.expense.dto;

import com.souvenir.expense.domain.Expense;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Builder
public class ExpenseResponse {

    private UUID id;
    private UUID tripId;
    private BigDecimal amount;
    private String currency;
    private String category;
    private String description;
    private LocalDate expenseDate;
    private Instant createdAt;

    public static ExpenseResponse from(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .tripId(expense.getTrip().getId())
                .amount(expense.getAmount())
                .currency(expense.getCurrency())
                .category(expense.getCategory().name())
                .description(expense.getDescription())
                .expenseDate(expense.getExpenseDate())
                .createdAt(expense.getCreatedAt())
                .build();
    }
}
