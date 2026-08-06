package com.souvenir.packing.dto;

import com.souvenir.packing.domain.PackingItem;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class PackingItemResponse {

    private UUID id;
    private UUID tripId;
    private String name;
    private String category;
    private int quantity;
    private boolean packed;
    private Instant createdAt;

    public static PackingItemResponse from(PackingItem item) {
        return PackingItemResponse.builder()
                .id(item.getId())
                .tripId(item.getTrip().getId())
                .name(item.getName())
                .category(item.getCategory() != null ? item.getCategory().name() : null)
                .quantity(item.getQuantity())
                .packed(item.isPacked())
                .createdAt(item.getCreatedAt())
                .build();
    }
}
