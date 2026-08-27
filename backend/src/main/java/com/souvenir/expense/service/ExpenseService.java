package com.souvenir.expense.service;

import com.souvenir.common.exception.BadRequestException;
import com.souvenir.common.exception.ForbiddenException;
import com.souvenir.common.exception.ResourceNotFoundException;
import com.souvenir.expense.domain.Expense;
import com.souvenir.expense.domain.ExpenseCategory;
import com.souvenir.expense.dto.ExpenseRequest;
import com.souvenir.expense.dto.ExpenseResponse;
import com.souvenir.expense.repository.ExpenseRepository;
import com.souvenir.trip.domain.Trip;
import com.souvenir.trip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final TripRepository tripRepository;

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getByTrip(UUID tripId, String email) {
        Trip trip = getActiveTrip(tripId);
        assertOwnership(trip, email);
        return expenseRepository.findAllByTripId(tripId)
                .stream().map(ExpenseResponse::from).toList();
    }

    @Transactional
    public ExpenseResponse addExpense(UUID tripId, ExpenseRequest request, String email) {
        if (request.getAmount() == null) {
            throw new BadRequestException("Amount is required");
        }
        Trip trip = getActiveTrip(tripId);
        assertOwnership(trip, email);

        Expense expense = Expense.builder()
                .trip(trip)
                .amount(request.getAmount())
                .currency(request.getCurrency() != null ? request.getCurrency().toUpperCase() : "USD")
                .category(request.getCategory() != null
                        ? ExpenseCategory.valueOf(request.getCategory())
                        : ExpenseCategory.OTHER)
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .expenseDate(request.getExpenseDate() != null ? request.getExpenseDate() : LocalDate.now())
                .build();

        return ExpenseResponse.from(expenseRepository.save(expense));
    }

    @Transactional
    public ExpenseResponse updateExpense(UUID expenseId, ExpenseRequest request, String email) {
        Expense expense = getActiveExpense(expenseId);
        assertOwnership(expense.getTrip(), email);

        if (request.getAmount() != null) {
            expense.setAmount(request.getAmount());
        }
        if (request.getCurrency() != null) {
            expense.setCurrency(request.getCurrency().toUpperCase());
        }
        if (request.getCategory() != null) {
            expense.setCategory(ExpenseCategory.valueOf(request.getCategory()));
        }
        if (request.getDescription() != null) {
            expense.setDescription(request.getDescription().trim());
        }
        if (request.getExpenseDate() != null) {
            expense.setExpenseDate(request.getExpenseDate());
        }

        return ExpenseResponse.from(expenseRepository.save(expense));
    }

    @Transactional
    public void deleteExpense(UUID expenseId, String email) {
        Expense expense = getActiveExpense(expenseId);
        assertOwnership(expense.getTrip(), email);
        expense.softDelete();
        expenseRepository.save(expense);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Trip getActiveTrip(UUID id) {
        return tripRepository.findById(id)
                .filter(t -> t.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", id));
    }

    private Expense getActiveExpense(UUID id) {
        return expenseRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", id));
    }

    private void assertOwnership(Trip trip, String email) {
        if (!trip.getUser().getEmail().equals(email)) {
            throw new ForbiddenException();
        }
    }
}
