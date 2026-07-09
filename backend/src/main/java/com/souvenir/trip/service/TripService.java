package com.souvenir.trip.service;

import com.souvenir.auth.domain.User;
import com.souvenir.auth.repository.UserRepository;
import com.souvenir.common.exception.ForbiddenException;
import com.souvenir.common.exception.ResourceNotFoundException;
import com.souvenir.common.response.PageResponse;
import com.souvenir.trip.domain.Trip;
import com.souvenir.trip.domain.TripStatus;
import com.souvenir.trip.dto.TripRequest;
import com.souvenir.trip.dto.TripResponse;
import com.souvenir.trip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PageResponse<TripResponse> getUserTrips(String email, TripStatus status, int page, int size) {
        User user = getUserByEmail(email);
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        var trips = (status != null)
                ? tripRepository.findAllByUserIdAndStatus(user.getId(), status, pageable)
                : tripRepository.findAllByUserId(user.getId(), pageable);

        return PageResponse.from(trips.map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public TripResponse getTripById(UUID tripId, String email) {
        Trip trip = getActiveTrip(tripId);
        assertOwnership(trip, email);
        return toResponse(trip);
    }

    @Transactional
    public TripResponse createTrip(TripRequest request, String email) {
        User user = getUserByEmail(email);

        Trip trip = Trip.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(request.getStatus() != null ? request.getStatus() : TripStatus.PLANNED)
                .build();

        return toResponse(tripRepository.save(trip));
    }

    @Transactional
    public TripResponse updateTrip(UUID tripId, TripRequest request, String email) {
        Trip trip = getActiveTrip(tripId);
        assertOwnership(trip, email);

        trip.setTitle(request.getTitle());
        trip.setDescription(request.getDescription());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        if (request.getStatus() != null) trip.setStatus(request.getStatus());

        return toResponse(tripRepository.save(trip));
    }

    @Transactional
    public void deleteTrip(UUID tripId, String email) {
        Trip trip = getActiveTrip(tripId);
        assertOwnership(trip, email);
        trip.softDelete();
        tripRepository.save(trip);
    }

    private Trip getActiveTrip(UUID tripId) {
        return tripRepository.findActiveById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", tripId));
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", email));
    }

    private void assertOwnership(Trip trip, String email) {
        if (!trip.getUser().getEmail().equals(email)) {
            throw new ForbiddenException();
        }
    }

    private TripResponse toResponse(Trip trip) {
        return TripResponse.builder()
                .id(trip.getId())
                .title(trip.getTitle())
                .description(trip.getDescription())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .coverPhotoUrl(trip.getCoverPhotoUrl())
                .status(trip.getStatus())
                .destinationCount(trip.getDestinations().size())
                .memoryCount(trip.getMemories().size())
                .photoCount(trip.getPhotos().size())
                .createdAt(trip.getCreatedAt())
                .updatedAt(trip.getUpdatedAt())
                .build();
    }
}
