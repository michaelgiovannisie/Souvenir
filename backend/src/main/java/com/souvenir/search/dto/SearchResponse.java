package com.souvenir.search.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class SearchResponse {

    private final List<TripResult>        trips;
    private final List<DestinationResult> destinations;
    private final List<MemoryResult>      memories;
    private final List<BucketListResult>  bucketList;
    private final int                     totalResults;

    // ── Nested result types ──────────────────────────────────────────────────

    @Getter
    @Builder
    public static class TripResult {
        private final UUID   id;
        private final String title;
        private final String status;
        private final String coverPhotoUrl;
    }

    @Getter
    @Builder
    public static class DestinationResult {
        private final UUID   id;
        private final UUID   tripId;
        private final String tripTitle;
        private final String name;
        private final String country;
        private final String city;
        private final String type;
    }

    @Getter
    @Builder
    public static class MemoryResult {
        private final UUID      id;
        private final UUID      tripId;
        private final String    tripTitle;
        private final String    title;
        private final String    mood;
        private final LocalDate memoryDate;
    }

    @Getter
    @Builder
    public static class BucketListResult {
        private final UUID    id;
        private final String  destinationName;
        private final String  country;
        private final boolean completed;
    }
}
