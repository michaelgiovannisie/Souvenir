package com.souvenir.memento.domain;

import com.souvenir.common.entity.BaseEntity;
import com.souvenir.trip.domain.Trip;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "trip_mementos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripMemento extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MementoType type;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 200)
    private String location;
}
