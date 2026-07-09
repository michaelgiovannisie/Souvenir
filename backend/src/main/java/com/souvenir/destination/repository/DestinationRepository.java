package com.souvenir.destination.repository;

import com.souvenir.destination.domain.Destination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DestinationRepository extends JpaRepository<Destination, UUID> {

    @Query("SELECT d FROM Destination d WHERE d.trip.id = :tripId AND d.deletedAt IS NULL ORDER BY d.arrivalDate ASC")
    List<Destination> findAllByTripId(UUID tripId);

    @Query("SELECT d FROM Destination d WHERE d.id = :id AND d.deletedAt IS NULL")
    Optional<Destination> findActiveById(UUID id);

    @Query("SELECT DISTINCT d.country FROM Destination d WHERE d.trip.user.id = :userId AND d.deletedAt IS NULL")
    List<String> findDistinctCountriesByUserId(UUID userId);
}
