package com.souvenir.stats.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Getter
@Builder
public class YearInReviewResponse {

    private int year;

    // Volume stats
    private int tripsCount;
    private long daysAbroad;
    private long memoriesCount;
    private long photosCount;

    // Places
    private int countriesCount;
    private int citiesCount;
    private List<String> countriesVisited;
    private String topCountry;

    // Monthly activity (12 values, 0-indexed, value = # of trips active that month)
    private int[] monthlyActivity;

    // Mood breakdown (mood name -> count)
    private Map<String, Long> moodBreakdown;

    // Expense totals per currency
    private Map<String, Double> expenseTotals;

    // Trip summaries for the year
    private List<TripSummary> tripSummaries;

    @Getter
    @Builder
    public static class TripSummary {
        private UUID id;
        private String title;
        private LocalDate startDate;
        private LocalDate endDate;
        private String coverPhotoUrl;
        private String status;
        private int destinationCount;
    }
}
