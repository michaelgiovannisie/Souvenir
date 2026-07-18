package com.souvenir.memory.dto;

import com.souvenir.memory.domain.Memory;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Builder
public class MemoryResponse {
    private final UUID id;
    private final UUID tripId;
    private final String tripTitle;
    private final UUID destinationId;
    private final String destinationName;
    private final String destinationCountry;
    private final String title;
    private final String journalEntry;
    private final LocalDate memoryDate;
    private final int photoCount;
    private final Instant createdAt;
    private final Instant updatedAt;

    public static MemoryResponse from(Memory memory) {
        return MemoryResponse.builder()
                .id(memory.getId())
                .tripId(memory.getTrip().getId())
                .tripTitle(memory.getTrip().getTitle())
                .destinationId(memory.getDestination() != null ? memory.getDestination().getId() : null)
                .destinationName(memory.getDestination() != null ? memory.getDestination().getName() : null)
                .destinationCountry(memory.getDestination() != null ? memory.getDestination().getCountry() : null)
                .title(memory.getTitle())
                .journalEntry(memory.getJournalEntry())
                .memoryDate(memory.getMemoryDate())
                .photoCount(memory.getPhotos() != null
                        ? (int) memory.getPhotos().stream().filter(p -> p.getDeletedAt() == null).count()
                        : 0)
                .createdAt(memory.getCreatedAt())
                .updatedAt(memory.getUpdatedAt())
                .build();
    }
}
