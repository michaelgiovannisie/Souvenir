package com.souvenir.stats.service;

import com.souvenir.auth.domain.User;
import com.souvenir.auth.repository.UserRepository;
import com.souvenir.common.exception.ResourceNotFoundException;
import com.souvenir.stats.dto.StatsResponse;
import com.souvenir.trip.domain.Trip;
import com.souvenir.trip.domain.TripStatus;
import com.souvenir.trip.repository.TripRepository;
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
}
