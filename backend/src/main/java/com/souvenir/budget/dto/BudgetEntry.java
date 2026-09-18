package com.souvenir.budget.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BudgetEntry {

    @NotNull
    @Pattern(regexp = "ACCOMMODATION|FOOD|TRANSPORT|ACTIVITIES|SHOPPING|OTHER",
             message = "Invalid category")
    private String category;

    @NotNull
    @DecimalMin(value = "0.01", message = "Amount must be positive")
    @Digits(integer = 8, fraction = 2)
    private BigDecimal amount;

    @Pattern(regexp = "[A-Z]{3}", message = "Currency must be a 3-letter ISO code")
    private String currency;
}
