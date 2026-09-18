package com.souvenir.budget.dto;

import jakarta.validation.Valid;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class BudgetRequest {

    @Valid
    private List<BudgetEntry> budgets = new ArrayList<>();
}
