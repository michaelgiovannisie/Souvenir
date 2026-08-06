package com.souvenir.packing.domain;

import com.souvenir.common.entity.BaseEntity;
import com.souvenir.trip.domain.Trip;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "packing_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PackingItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private PackingCategory category;

    @Column(nullable = false)
    @Builder.Default
    private int quantity = 1;

    @Column(name = "is_packed", nullable = false)
    @Builder.Default
    private boolean packed = false;
}
