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

    @Query("""
            SELECT m FROM Memory m
            LEFT JOIN FETCH m.destination
            JOIN FETCH m.trip t
            WHERE t.user.email = :email AND m.deletedAt IS NULL AND t.deletedAt IS NULL
            ORDER BY m.memoryDate DESC NULLS LAST, m.createdAt DESC
            """)
    List<Memory> findAllByUserEmail(String email);

    @Query("SELECT COUNT(m) FROM Memory m WHERE m.trip.user.id = :userId AND m.deletedAt IS NULL")
    long countByUserId(UUID userId);

    @Query("""
            SELECT m FROM Memory m JOIN FETCH m.trip t WHERE t.user.email = :email
            AND m.deletedAt IS NULL AND t.deletedAt IS NULL
            AND (LOWER(m.title) LIKE :q OR LOWER(m.journalEntry) LIKE :q)
            ORDER BY m.createdAt DESC
            """)
    List<Memory> search(String email, String q, org.springframework.data.domain.Pageable pageable);
}
