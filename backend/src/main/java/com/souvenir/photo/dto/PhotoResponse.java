package com.souvenir.photo.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class PhotoResponse {
    private final UUID id;
    private final UUID tripId;
    private final UUID memoryId;
    private final UUID destinationId;
    private final String cloudinaryUrl;
    private final String caption;
    private final Instant takenAt;
    private final Instant createdAt;
}
