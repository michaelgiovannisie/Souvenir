package com.souvenir.bucketlist.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class BucketListResponse {
    private final UUID id;
    private final String destinationName;
    private final String country;
    private final String notes;
    private final boolean completed;
    private final Instant completedAt;
    private final Instant createdAt;
}
