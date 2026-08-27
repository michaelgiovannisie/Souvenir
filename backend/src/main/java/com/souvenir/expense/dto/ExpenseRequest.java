package com.souvenir.expense.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class ExpenseRequest {

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    @Digits(integer = 8, fraction = 2, message = "Amount has too many digits")
    private BigDecimal amount;

    @Pattern(regexp = "[A-Z]{3}", message = "Currency must be a 3-letter ISO code (e.g. USD)")
    private String currency;

    @Pattern(regexp = "ACCOMMODATION|FOOD|TRANSPORT|ACTIVITIES|SHOPPING|OTHER",
             message = "Invalid category")
    private String category;

    @Size(max = 200, message = "Description must be 200 characters or fewer")
    private String description;

    private LocalDate expenseDate;
}
