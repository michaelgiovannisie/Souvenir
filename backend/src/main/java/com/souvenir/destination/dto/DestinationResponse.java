package com.souvenir.destination.dto;

import com.souvenir.destination.domain.DestinationType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Builder
public class DestinationResponse {
    private final UUID id;
    private final UUID tripId;
    private final String name;
    private final String country;
    private final String stateProvince;
    private final String city;
    private final BigDecimal latitude;
    private final BigDecimal longitude;
    private final DestinationType type;
    private final LocalDate arrivalDate;
    private final LocalDate departureDate;
    private final String notes;
    private final Short rating;
    private final Instant createdAt;
}
