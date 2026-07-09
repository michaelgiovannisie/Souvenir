package com.souvenir.photo.repository;

import com.souvenir.photo.domain.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PhotoRepository extends JpaRepository<Photo, UUID> {

    @Query("SELECT p FROM Photo p WHERE p.trip.id = :tripId AND p.deletedAt IS NULL ORDER BY p.takenAt DESC")
    List<Photo> findAllByTripId(UUID tripId);

    @Query("SELECT p FROM Photo p WHERE p.memory.id = :memoryId AND p.deletedAt IS NULL")
    List<Photo> findAllByMemoryId(UUID memoryId);

    @Query("SELECT p FROM Photo p WHERE p.id = :id AND p.deletedAt IS NULL")
    Optional<Photo> findActiveById(UUID id);
}
