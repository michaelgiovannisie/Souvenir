package com.souvenir.packing.repository;

import com.souvenir.packing.domain.PackingItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PackingItemRepository extends JpaRepository<PackingItem, UUID> {

    @Query("""
            SELECT p FROM PackingItem p
            WHERE p.trip.id = :tripId AND p.deletedAt IS NULL
            ORDER BY p.category NULLS LAST, p.createdAt ASC
            """)
    List<PackingItem> findAllByTripId(@Param("tripId") UUID tripId);

    @Query("SELECT p FROM PackingItem p WHERE p.id = :id AND p.deletedAt IS NULL")
    Optional<PackingItem> findActiveById(@Param("id") UUID id);
}
