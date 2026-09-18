package com.souvenir.budget.repository;

import com.souvenir.budget.domain.TripBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface TripBudgetRepository extends JpaRepository<TripBudget, UUID> {

    @Query("SELECT b FROM TripBudget b WHERE b.trip.id = :tripId AND b.deletedAt IS NULL")
    List<TripBudget> findAllByTripId(UUID tripId);

    @Modifying
    @Query("UPDATE TripBudget b SET b.deletedAt = :now WHERE b.trip.id = :tripId AND b.deletedAt IS NULL")
    void softDeleteAllByTripId(UUID tripId, Instant now);
}
