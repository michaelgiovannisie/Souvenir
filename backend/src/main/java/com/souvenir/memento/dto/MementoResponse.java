package com.souvenir.memento.dto;

import com.souvenir.memento.domain.TripMemento;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class MementoResponse {

    private final UUID id;
    private final String type;
    private final String name;
    private final String description;
    private final String location;
    private final Instant createdAt;

    public static MementoResponse from(TripMemento m) {
        return MementoResponse.builder()
                .id(m.getId())
                .type(m.getType().name())
                .name(m.getName())
                .description(m.getDescription())
                .location(m.getLocation())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
