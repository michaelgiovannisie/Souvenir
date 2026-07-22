package com.souvenir.search.service;

import com.souvenir.bucketlist.repository.BucketListRepository;
import com.souvenir.destination.repository.DestinationRepository;
import com.souvenir.memory.repository.MemoryRepository;
import com.souvenir.search.dto.SearchResponse;
import com.souvenir.trip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchService {

    private static final int MAX_PER_CATEGORY = 5;

    private final TripRepository        tripRepository;
    private final DestinationRepository destinationRepository;
    private final MemoryRepository      memoryRepository;
    private final BucketListRepository  bucketListRepository;

    @Transactional(readOnly = true)
    public SearchResponse search(String query, String email) {
        if (query == null || query.isBlank() || query.length() < 2) {
            return empty();
        }

        String q = "%" + query.toLowerCase().trim() + "%";
        var pageable = PageRequest.of(0, MAX_PER_CATEGORY);

        var trips = tripRepository.search(email, q, pageable).stream()
                .map(t -> SearchResponse.TripResult.builder()
                        .id(t.getId())
                        .title(t.getTitle())
                        .status(t.getStatus().name())
                        .coverPhotoUrl(t.getCoverPhotoUrl())
                        .build())
                .toList();

        var destinations = destinationRepository.search(email, q, pageable).stream()
                .map(d -> SearchResponse.DestinationResult.builder()
                        .id(d.getId())
                        .tripId(d.getTrip().getId())
                        .tripTitle(d.getTrip().getTitle())
                        .name(d.getName())
                        .country(d.getCountry())
                        .city(d.getCity())
                        .type(d.getType().name())
                        .build())
                .toList();

        var memories = memoryRepository.search(email, q, pageable).stream()
                .map(m -> SearchResponse.MemoryResult.builder()
                        .id(m.getId())
                        .tripId(m.getTrip().getId())
                        .tripTitle(m.getTrip().getTitle())
                        .title(m.getTitle())
                        .mood(m.getMood())
                        .memoryDate(m.getMemoryDate())
                        .build())
                .toList();

        var bucketList = bucketListRepository.search(email, q, pageable).stream()
                .map(b -> SearchResponse.BucketListResult.builder()
                        .id(b.getId())
                        .destinationName(b.getDestinationName())
                        .country(b.getCountry())
                        .completed(b.getCompletedAt() != null)
                        .build())
                .toList();

        int total = trips.size() + destinations.size() + memories.size() + bucketList.size();

        return SearchResponse.builder()
                .trips(trips)
                .destinations(destinations)
                .memories(memories)
                .bucketList(bucketList)
                .totalResults(total)
                .build();
    }

    private SearchResponse empty() {
        return SearchResponse.builder()
                .trips(List.of())
                .destinations(List.of())
                .memories(List.of())
                .bucketList(List.of())
                .totalResults(0)
                .build();
    }
}
