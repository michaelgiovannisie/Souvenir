package com.souvenir.budget.service;

import com.souvenir.budget.domain.TripBudget;
import com.souvenir.budget.dto.BudgetRequest;
import com.souvenir.budget.dto.BudgetResponse;
import com.souvenir.budget.repository.TripBudgetRepository;
import com.souvenir.common.exception.ForbiddenException;
import com.souvenir.common.exception.ResourceNotFoundException;
import com.souvenir.expense.domain.ExpenseCategory;
import com.souvenir.trip.domain.Trip;
import com.souvenir.trip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripBudgetService {

    private final TripBudgetRepository budgetRepository;
    private final TripRepository tripRepository;

    @Transactional(readOnly = true)
    public List<BudgetResponse> getBudgets(UUID tripId, String email) {
        Trip trip = getActiveTrip(tripId);
        assertOwnership(trip, email);
        return budgetRepository.findAllByTripId(tripId).stream()
                .map(BudgetResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Replace all budgets for the trip with the provided list.
     * Entries with amount <= 0 are ignored (treated as "unset").
     */
    @Transactional
    public List<BudgetResponse> saveBudgets(UUID tripId, BudgetRequest request, String email) {
        Trip trip = getActiveTrip(tripId);
        assertOwnership(trip, email);

        // Soft-delete all existing budgets for this trip
        budgetRepository.softDeleteAllByTripId(tripId, Instant.now());

        // Insert the new set
        List<TripBudget> newBudgets = request.getBudgets().stream()
                .filter(e -> e.getAmount() != null && e.getAmount().signum() > 0)
                .map(e -> TripBudget.builder()
                        .trip(trip)
                        .category(ExpenseCategory.valueOf(e.getCategory()))
                        .amount(e.getAmount())
                        .currency(e.getCurrency() != null ? e.getCurrency() : "USD")
                        .build())
                .collect(Collectors.toList());

        return budgetRepository.saveAll(newBudgets).stream()
                .map(BudgetResponse::from)
                .collect(Collectors.toList());
    }

    private Trip getActiveTrip(UUID tripId) {
        return tripRepository.findActiveById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", tripId));
    }

    private void assertOwnership(Trip trip, String email) {
        if (!trip.getUser().getEmail().equals(email)) throw new ForbiddenException();
    }
}
