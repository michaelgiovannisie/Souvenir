package com.souvenir.destination.service;

import com.souvenir.common.exception.ForbiddenException;
import com.souvenir.common.exception.ResourceNotFoundException;
import com.souvenir.destination.domain.Destination;
import com.souvenir.destination.domain.DestinationType;
import com.souvenir.destination.dto.DestinationRequest;
import com.souvenir.destination.dto.DestinationResponse;
import com.souvenir.destination.repository.DestinationRepository;
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
public class DestinationService {

    private final DestinationRepository destinationRepository;
    private final TripRepository tripRepository;

    @Transactional(readOnly = true)
    public List<DestinationResponse> getTripDestinations(UUID tripId, String email) {
        Trip trip = getActiveTrip(tripId);
        assertOwnership(trip, email);
        return destinationRepository.findAllByTripId(tripId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public DestinationResponse addDestination(UUID tripId, DestinationRequest request, String email) {
        Trip trip = getActiveTrip(tripId);
        assertOwnership(trip, email);

        Destination destination = Destination.builder()
                .trip(trip)
                .name(request.getName())
                .country(request.getCountry())
                .stateProvince(request.getStateProvince())
                .city(request.getCity())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .type(request.getType() != null ? request.getType() : DestinationType.CITY)
                .arrivalDate(request.getArrivalDate())
                .departureDate(request.getDepartureDate())
                .notes(request.getNotes())
                .rating(request.getRating())
                .build();

        return toResponse(destinationRepository.save(destination));
    }

    @Transactional
    public DestinationResponse updateDestination(UUID destinationId, DestinationRequest request, String email) {
        Destination destination = getActiveDestination(destinationId);
        assertOwnership(destination.getTrip(), email);

        destination.setName(request.getName());
        destination.setCountry(request.getCountry());
        destination.setStateProvince(request.getStateProvince());
        destination.setCity(request.getCity());
        destination.setLatitude(request.getLatitude());
        destination.setLongitude(request.getLongitude());
        if (request.getType() != null) destination.setType(request.getType());
        destination.setArrivalDate(request.getArrivalDate());
        destination.setDepartureDate(request.getDepartureDate());
        destination.setNotes(request.getNotes());
        destination.setRating(request.getRating());

        return toResponse(destinationRepository.save(destination));
    }

    @Transactional
    public void deleteDestination(UUID destinationId, String email) {
        Destination destination = getActiveDestination(destinationId);
        assertOwnership(destination.getTrip(), email);
        destination.softDelete();
        destinationRepository.save(destination);
    }

    private Trip getActiveTrip(UUID tripId) {
        return tripRepository.findActiveById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", tripId));
    }

    private Destination getActiveDestination(UUID id) {
        return destinationRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Destination", id));
    }

    private void assertOwnership(Trip trip, String email) {
        if (!trip.getUser().getEmail().equals(email)) {
            throw new ForbiddenException();
        }
    }

    private DestinationResponse toResponse(Destination d) {
        return DestinationResponse.builder()
                .id(d.getId())
                .tripId(d.getTrip().getId())
                .name(d.getName())
                .country(d.getCountry())
                .stateProvince(d.getStateProvince())
                .city(d.getCity())
                .latitude(d.getLatitude())
                .longitude(d.getLongitude())
                .type(d.getType())
                .arrivalDate(d.getArrivalDate())
                .departureDate(d.getDepartureDate())
                .notes(d.getNotes())
                .rating(d.getRating())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
