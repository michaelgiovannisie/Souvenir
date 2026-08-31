package com.souvenir.stats.service;

import com.souvenir.auth.domain.User;
import com.souvenir.auth.repository.UserRepository;
import com.souvenir.common.exception.ResourceNotFoundException;
import com.souvenir.stats.dto.StatsResponse;
import com.souvenir.stats.dto.YearInReviewResponse;
import com.souvenir.trip.domain.Trip;
import com.souvenir.trip.domain.TripStatus;
import com.souvenir.trip.repository.TripRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final UserRepository userRepository;
    private final TripRepository tripRepository;

    @PersistenceContext
    private EntityManager em;

    @Transactional(readOnly = true)
    public StatsResponse getStats(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", email));
        UUID userId = user.getId();

        // --- Trip counts ---
        List<Trip> allTrips = em.createQuery(
                "SELECT t FROM Trip t WHERE t.user.id = :userId AND t.deletedAt IS NULL", Trip.class)
                .setParameter("userId", userId)
                .getResultList();

        long totalTrips = allTrips.size();
        long completedTrips = allTrips.stream().filter(t -> t.getStatus() == TripStatus.COMPLETED).count();
        long ongoingTrips = allTrips.stream().filter(t -> t.getStatus() == TripStatus.ONGOING).count();
        long plannedTrips = allTrips.stream().filter(t -> t.getStatus() == TripStatus.PLANNED).count();

        // --- Days traveled ---
        long totalDays = allTrips.stream()
                .filter(t -> t.getStartDate() != null && t.getEndDate() != null)
                .mapToLong(t -> ChronoUnit.DAYS.between(t.getStartDate(), t.getEndDate()) + 1)
                .sum();

        // --- Longest trip ---
        Optional<Trip> longestTrip = allTrips.stream()
                .filter(t -> t.getStartDate() != null && t.getEndDate() != null)
                .max(Comparator.comparingLong(
                        t -> ChronoUnit.DAYS.between(t.getStartDate(), t.getEndDate())));

        long longestTripDays = longestTrip
                .map(t -> ChronoUnit.DAYS.between(t.getStartDate(), t.getEndDate()) + 1)
                .orElse(0L);
        String longestTripTitle = longestTrip.map(Trip::getTitle).orElse(null);

        // --- Destinations ---
        @SuppressWarnings("unchecked")
        List<Object[]> destRows = em.createQuery(
                "SELECT d.country, d.city FROM com.souvenir.destination.domain.Destination d " +
                "WHERE d.trip.user.id = :userId AND d.deletedAt IS NULL")
                .setParameter("userId", userId)
                .getResultList();

        long totalDestinations = destRows.size();

        Set<String> countries = destRows.stream()
                .map(r -> (String) r[0])
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<String> cities = destRows.stream()
                .map(r -> (String) r[1])
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // Country frequency map
        Map<String, Long> countryFreq = destRows.stream()
                .map(r -> (String) r[0])
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(c -> c, Collectors.counting()));

        String mostVisitedCountry = countryFreq.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);

        long mostVisitedCountryCount = mostVisitedCountry != null
                ? countryFreq.get(mostVisitedCountry) : 0L;

        // Top 8 countries by destination count
        List<StatsResponse.CountryCount> topCountries = countryFreq.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(8)
                .map(e -> StatsResponse.CountryCount.builder()
                        .country(e.getKey())
                        .count(e.getValue())
                        .build())
                .collect(Collectors.toList());

        // --- Memories ---
        long totalMemories = (long) em.createQuery(
                "SELECT COUNT(m) FROM com.souvenir.memory.domain.Memory m " +
                "WHERE m.trip.user.id = :userId AND m.deletedAt IS NULL")
                .setParameter("userId", userId)
                .getSingleResult();

        // --- Photos ---
        long totalPhotos = (long) em.createQuery(
                "SELECT COUNT(p) FROM com.souvenir.photo.domain.Photo p " +
                "WHERE p.trip.user.id = :userId AND p.deletedAt IS NULL")
                .setParameter("userId", userId)
                .getSingleResult();

        return StatsResponse.builder()
                .totalTrips(totalTrips)
                .completedTrips(completedTrips)
                .ongoingTrips(ongoingTrips)
                .plannedTrips(plannedTrips)
                .totalDestinations(totalDestinations)
                .uniqueCountries(countries.size())
                .uniqueCities(cities.size())
                .countriesVisited(new ArrayList<>(countries).stream().sorted().collect(Collectors.toList()))
                .totalDaysTraveled(totalDays)
                .longestTripDays(longestTripDays)
                .longestTripTitle(longestTripTitle)
                .totalMemories(totalMemories)
                .totalPhotos(totalPhotos)
                .mostVisitedCountry(mostVisitedCountry)
                .mostVisitedCountryCount(mostVisitedCountryCount)
                .topCountries(topCountries)
                .build();
    }

    // ── Year in Review ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public YearInReviewResponse getYearInReview(String email, int year) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", email));
        UUID userId = user.getId();

        LocalDate yearStart = LocalDate.of(year, 1, 1);
        LocalDate yearEnd   = LocalDate.of(year, 12, 31);

        // ── Trips active in this year ─────────────────────────────────────────
        @SuppressWarnings("unchecked")
        List<Trip> yearTrips = em.createQuery(
                "SELECT t FROM Trip t " +
                "WHERE t.user.id = :userId AND t.deletedAt IS NULL " +
                "AND (" +
                "  (t.startDate IS NOT NULL AND t.startDate >= :yearStart AND t.startDate <= :yearEnd) " +
                "  OR (t.endDate IS NOT NULL AND t.endDate >= :yearStart AND t.endDate <= :yearEnd) " +
                "  OR (t.startDate IS NOT NULL AND t.endDate IS NOT NULL AND t.startDate < :yearStart AND t.endDate > :yearEnd)" +
                ") " +
                "ORDER BY t.startDate ASC NULLS LAST", Trip.class)
                .setParameter("userId", userId)
                .setParameter("yearStart", yearStart)
                .setParameter("yearEnd", yearEnd)
                .getResultList();

        List<UUID> tripIds = yearTrips.stream().map(Trip::getId).collect(Collectors.toList());

        // ── Days abroad (clipped to the year) ────────────────────────────────
        long daysAbroad = yearTrips.stream()
                .filter(t -> t.getStartDate() != null && t.getEndDate() != null)
                .mapToLong(t -> {
                    LocalDate s = t.getStartDate().isBefore(yearStart) ? yearStart : t.getStartDate();
                    LocalDate e = t.getEndDate().isAfter(yearEnd) ? yearEnd : t.getEndDate();
                    return java.time.temporal.ChronoUnit.DAYS.between(s, e) + 1;
                })
                .sum();

        // ── Monthly activity (0-indexed, count of trips active each month) ───
        int[] monthlyActivity = new int[12];
        for (Trip t : yearTrips) {
            if (t.getStartDate() == null && t.getEndDate() == null) continue;
            LocalDate s = t.getStartDate() != null
                    ? (t.getStartDate().isBefore(yearStart) ? yearStart : t.getStartDate())
                    : yearStart;
            LocalDate e = t.getEndDate() != null
                    ? (t.getEndDate().isAfter(yearEnd) ? yearEnd : t.getEndDate())
                    : yearEnd;
            for (int m = s.getMonthValue() - 1; m <= e.getMonthValue() - 1 && m < 12; m++) {
                monthlyActivity[m]++;
            }
        }

        // ── Destinations ──────────────────────────────────────────────────────
        List<Object[]> destRows = tripIds.isEmpty() ? List.of() :
                em.createQuery(
                "SELECT d.country, d.city FROM com.souvenir.destination.domain.Destination d " +
                "WHERE d.trip.id IN :tripIds AND d.deletedAt IS NULL")
                .setParameter("tripIds", tripIds)
                .getResultList();

        Set<String> countries = destRows.stream()
                .map(r -> (String) r[0]).filter(Objects::nonNull).collect(Collectors.toSet());
        Set<String> cities = destRows.stream()
                .map(r -> (String) r[1]).filter(Objects::nonNull).collect(Collectors.toSet());

        Map<String, Long> countryFreq = destRows.stream()
                .map(r -> (String) r[0]).filter(Objects::nonNull)
                .collect(Collectors.groupingBy(c -> c, Collectors.counting()));
        String topCountry = countryFreq.entrySet().stream()
                .max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse(null);

        // ── Memories + moods ─────────────────────────────────────────────────
        long memoriesCount = tripIds.isEmpty() ? 0L :
                (long) em.createQuery(
                "SELECT COUNT(m) FROM com.souvenir.memory.domain.Memory m " +
                "WHERE m.trip.id IN :tripIds AND m.deletedAt IS NULL")
                .setParameter("tripIds", tripIds)
                .getSingleResult();

        List<Object[]> moodRows = tripIds.isEmpty() ? List.of() :
                em.createQuery(
                "SELECT m.mood, COUNT(m) FROM com.souvenir.memory.domain.Memory m " +
                "WHERE m.trip.id IN :tripIds AND m.deletedAt IS NULL AND m.mood IS NOT NULL " +
                "GROUP BY m.mood")
                .setParameter("tripIds", tripIds)
                .getResultList();

        Map<String, Long> moodBreakdown = new LinkedHashMap<>();
        moodRows.stream()
                .sorted((a, b) -> Long.compare((long) b[1], (long) a[1]))
                .forEach(r -> moodBreakdown.put(r[0].toString(), (long) r[1]));

        // ── Photos ────────────────────────────────────────────────────────────
        long photosCount = tripIds.isEmpty() ? 0L :
                (long) em.createQuery(
                "SELECT COUNT(p) FROM com.souvenir.photo.domain.Photo p " +
                "WHERE p.trip.id IN :tripIds AND p.deletedAt IS NULL")
                .setParameter("tripIds", tripIds)
                .getSingleResult();

        // ── Expenses ─────────────────────────────────────────────────────────
        List<Object[]> expenseRows = tripIds.isEmpty() ? List.of() :
                em.createQuery(
                "SELECT e.currency, SUM(e.amount) FROM com.souvenir.expense.domain.Expense e " +
                "WHERE e.trip.id IN :tripIds AND e.deletedAt IS NULL " +
                "GROUP BY e.currency")
                .setParameter("tripIds", tripIds)
                .getResultList();

        Map<String, Double> expenseTotals = new LinkedHashMap<>();
        expenseRows.forEach(r -> expenseTotals.put(
                (String) r[0],
                ((BigDecimal) r[1]).doubleValue()
        ));

        // ── Trip summaries ────────────────────────────────────────────────────
        List<YearInReviewResponse.TripSummary> tripSummaries = yearTrips.stream()
                .map(t -> YearInReviewResponse.TripSummary.builder()
                        .id(t.getId())
                        .title(t.getTitle())
                        .startDate(t.getStartDate())
                        .endDate(t.getEndDate())
                        .coverPhotoUrl(t.getCoverPhotoUrl())
                        .status(t.getStatus().name())
                        .destinationCount(t.getDestinations().size())
                        .build())
                .collect(Collectors.toList());

        return YearInReviewResponse.builder()
                .year(year)
                .tripsCount(yearTrips.size())
                .daysAbroad(daysAbroad)
                .memoriesCount(memoriesCount)
                .photosCount(photosCount)
                .countriesCount(countries.size())
                .citiesCount(cities.size())
                .countriesVisited(new ArrayList<>(countries).stream().sorted().collect(Collectors.toList()))
                .topCountry(topCountry)
                .monthlyActivity(monthlyActivity)
                .moodBreakdown(moodBreakdown)
                .expenseTotals(expenseTotals)
                .tripSummaries(tripSummaries)
                .build();
    }
}
