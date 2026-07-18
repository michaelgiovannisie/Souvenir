package com.souvenir.memory.service;

import com.souvenir.common.exception.ForbiddenException;
import com.souvenir.common.exception.ResourceNotFoundException;
import com.souvenir.destination.domain.Destination;
import com.souvenir.destination.repository.DestinationRepository;
import com.souvenir.memory.domain.Memory;
import com.souvenir.memory.dto.MemoryRequest;
import com.souvenir.memory.dto.MemoryResponse;
import com.souvenir.memory.repository.MemoryRepository;
import com.souvenir.trip.domain.Trip;
import com.souvenir.trip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MemoryService {

    private final MemoryRepository memoryRepository;
    private final TripRepository tripRepository;
    private final DestinationRepository destinationRepository;

    @Transactional(readOnly = true)
    public List<MemoryResponse> getAllMemories(String email) {
        return memoryRepository.findAllByUserEmail(email)
                .stream()
                .map(MemoryResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MemoryResponse> getTripMemories(UUID tripId, String email) {
        Trip trip = getActiveTrip(tripId);
        assertOwnership(trip, email);
        return memoryRepository.findAllByTripId(tripId)
                .stream()
                .map(MemoryResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public MemoryResponse createMemory(UUID tripId, MemoryRequest request, String email) {
        Trip trip = getActiveTrip(tripId);
        assertOwnership(trip, email);

        Destination destination = null;
        if (request.getDestinationId() != null) {
            destination = destinationRepository.findActiveById(request.getDestinationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Destination", request.getDestinationId()));
        }

        Memory memory = Memory.builder()
                .trip(trip)
                .destination(destination)
                .title(request.getTitle())
                .journalEntry(request.getJournalEntry())
                .memoryDate(request.getMemoryDate())
                .build();

        return MemoryResponse.from(memoryRepository.save(memory));
    }

    @Transactional
    public MemoryResponse updateMemory(UUID memoryId, MemoryRequest request, String email) {
        Memory memory = getActiveMemory(memoryId);
        assertOwnership(memory.getTrip(), email);

        Destination destination = null;
        if (request.getDestinationId() != null) {
            destination = destinationRepository.findActiveById(request.getDestinationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Destination", request.getDestinationId()));
        }

        memory.setTitle(request.getTitle());
        memory.setJournalEntry(request.getJournalEntry());
        memory.setMemoryDate(request.getMemoryDate());
        memory.setDestination(destination);

        return MemoryResponse.from(memoryRepository.save(memory));
    }

    @Transactional
    public void deleteMemory(UUID memoryId, String email) {
        Memory memory = getActiveMemory(memoryId);
        assertOwnership(memory.getTrip(), email);
        memory.softDelete();
        memoryRepository.save(memory);
    }

    private Trip getActiveTrip(UUID tripId) {
        return tripRepository.findActiveById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", tripId));
    }

    private Memory getActiveMemory(UUID memoryId) {
        return memoryRepository.findActiveById(memoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Memory", memoryId));
    }

    private void assertOwnership(Trip trip, String email) {
        if (!trip.getUser().getEmail().equals(email)) throw new ForbiddenException();
    }
}
