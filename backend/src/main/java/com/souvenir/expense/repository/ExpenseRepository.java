package com.souvenir.expense.repository;

import com.souvenir.expense.domain.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    @Query("SELECT e FROM Expense e WHERE e.trip.id = :tripId AND e.deletedAt IS NULL ORDER BY e.expenseDate DESC, e.createdAt DESC")
    List<Expense> findAllByTripId(UUID tripId);

    @Query("SELECT e FROM Expense e WHERE e.id = :id AND e.deletedAt IS NULL")
    Optional<Expense> findActiveById(UUID id);
}
