package com.souvenir.stats.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class StatsResponse {

    // Trips
    private final long totalTrips;
    private final long completedTrips;
    private final long ongoingTrips;
    private final long plannedTrips;

    // Places
    private final long totalDestinations;
    private final long uniqueCountries;
    private final long uniqueCities;
    private final List<String> countriesVisited;

    // Time
    private final long totalDaysTraveled;
    private final long longestTripDays;
    private final String longestTripTitle;

    // Content
    private final long totalMemories;
    private final long totalPhotos;

    // Highlights
    private final String mostVisitedCountry;
    private final long mostVisitedCountryCount;

    // Country visit counts for chart
    private final List<CountryCount> topCountries;

    @Getter
    @Builder
    public static class CountryCount {
        private final String country;
        private final long count;
    }
}
