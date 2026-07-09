package com.souvenir.trip.dto;

import com.souvenir.trip.domain.TripStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Builder
public class TripResponse {
    private final UUID id;
    private final String title;
    private final String description;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final String coverPhotoUrl;
    private final TripStatus status;
    private final int destinationCount;
    private final int memoryCount;
    private final int photoCount;
    private final Instant createdAt;
    private final Instant updatedAt;
}
