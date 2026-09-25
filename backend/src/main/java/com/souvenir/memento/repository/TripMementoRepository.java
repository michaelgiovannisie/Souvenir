package com.souvenir.memento.repository;

import com.souvenir.memento.domain.TripMemento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface TripMementoRepository extends JpaRepository<TripMemento, UUID> {

    @Query("SELECT m FROM TripMemento m WHERE m.trip.id = :tripId AND m.deletedAt IS NULL ORDER BY m.createdAt ASC")
    List<TripMemento> findAllByTripId(UUID tripId);
}
