package com.souvenir.budget.dto;

import com.souvenir.budget.domain.TripBudget;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class BudgetResponse {
    private final UUID id;
    private final String category;
    private final BigDecimal amount;
    private final String currency;

    public static BudgetResponse from(TripBudget b) {
        return BudgetResponse.builder()
                .id(b.getId())
                .category(b.getCategory().name())
                .amount(b.getAmount())
                .currency(b.getCurrency())
                .build();
    }
}
