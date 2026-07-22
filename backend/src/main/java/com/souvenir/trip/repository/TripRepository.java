package com.souvenir.trip.repository;

import com.souvenir.trip.domain.Trip;
import com.souvenir.trip.domain.TripStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TripRepository extends JpaRepository<Trip, UUID> {

    @Query("SELECT t FROM Trip t WHERE t.user.id = :userId AND t.deletedAt IS NULL")
    Page<Trip> findAllByUserId(UUID userId, Pageable pageable);

    @Query("SELECT t FROM Trip t WHERE t.user.id = :userId AND t.status = :status AND t.deletedAt IS NULL")
    Page<Trip> findAllByUserIdAndStatus(UUID userId, TripStatus status, Pageable pageable);

    @Query("SELECT t FROM Trip t WHERE t.id = :id AND t.deletedAt IS NULL")
    Optional<Trip> findActiveById(UUID id);

    @Query("SELECT COUNT(t) FROM Trip t WHERE t.user.id = :userId AND t.status = 'COMPLETED' AND t.deletedAt IS NULL")
    long countCompletedByUserId(UUID userId);

    @Query("""
            SELECT t FROM Trip t WHERE t.user.email = :email AND t.deletedAt IS NULL
            AND (LOWER(t.title) LIKE :q OR LOWER(t.description) LIKE :q)
            ORDER BY t.createdAt DESC
            """)
    List<Trip> search(String email, String q, Pageable pageable);
}
