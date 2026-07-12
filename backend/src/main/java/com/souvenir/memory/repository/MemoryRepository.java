package com.souvenir.memory.repository;

import com.souvenir.memory.domain.Memory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MemoryRepository extends JpaRepository<Memory, UUID> {

    @Query("SELECT m FROM Memory m LEFT JOIN FETCH m.destination WHERE m.trip.id = :tripId AND m.deletedAt IS NULL ORDER BY m.memoryDate DESC NULLS LAST, m.createdAt DESC")
    List<Memory> findAllByTripId(UUID tripId);

    @Query("SELECT m FROM Memory m WHERE m.id = :id AND m.deletedAt IS NULL")
    Optional<Memory> findActiveById(UUID id);

    @Query("SELECT COUNT(m) FROM Memory m WHERE m.trip.user.id = :userId AND m.deletedAt IS NULL")
    long countByUserId(UUID userId);
}
