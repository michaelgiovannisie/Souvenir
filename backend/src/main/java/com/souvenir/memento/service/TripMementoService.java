package com.souvenir.memento.service;

import com.souvenir.common.exception.ForbiddenException;
import com.souvenir.common.exception.ResourceNotFoundException;
import com.souvenir.memento.domain.MementoType;
import com.souvenir.memento.domain.TripMemento;
import com.souvenir.memento.dto.MementoRequest;
import com.souvenir.memento.dto.MementoResponse;
import com.souvenir.memento.repository.TripMementoRepository;
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
public class TripMementoService {

    private final TripMementoRepository mementoRepository;
    private final TripRepository tripRepository;

    @Transactional(readOnly = true)
    public List<MementoResponse> getMementos(UUID tripId, String email) {
        Trip trip = getActiveTrip(tripId);
        assertOwnership(trip, email);
        return mementoRepository.findAllByTripId(tripId).stream()
                .map(MementoResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public MementoResponse createMemento(UUID tripId, MementoRequest request, String email) {
        Trip trip = getActiveTrip(tripId);
        assertOwnership(trip, email);

        TripMemento memento = TripMemento.builder()
                .trip(trip)
                .type(MementoType.valueOf(request.getType()))
                .name(request.getName())
                .description(request.getDescription())
                .location(request.getLocation())
                .build();

        return MementoResponse.from(mementoRepository.save(memento));
    }

    @Transactional
    public MementoResponse updateMemento(UUID mementoId, MementoRequest request, String email) {
        TripMemento memento = getActiveMemento(mementoId);
        assertOwnership(memento.getTrip(), email);

        memento.setType(MementoType.valueOf(request.getType()));
        memento.setName(request.getName());
        memento.setDescription(request.getDescription());
        memento.setLocation(request.getLocation());

        return MementoResponse.from(mementoRepository.save(memento));
    }

    @Transactional
    public void deleteMemento(UUID mementoId, String email) {
        TripMemento memento = getActiveMemento(mementoId);
        assertOwnership(memento.getTrip(), email);
        memento.setDeletedAt(Instant.now());
        mementoRepository.save(memento);
    }

    private Trip getActiveTrip(UUID tripId) {
        return tripRepository.findActiveById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", tripId));
    }

    private TripMemento getActiveMemento(UUID id) {
        return mementoRepository.findById(id)
                .filter(m -> m.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Memento", id));
    }

    private void assertOwnership(Trip trip, String email) {
        if (!trip.getUser().getEmail().equals(email)) throw new ForbiddenException();
    }
}
