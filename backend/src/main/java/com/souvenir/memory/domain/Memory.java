package com.souvenir.memory.domain;

import com.souvenir.common.entity.BaseEntity;
import com.souvenir.destination.domain.Destination;
import com.souvenir.photo.domain.Photo;
import com.souvenir.trip.domain.Trip;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "memories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Memory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_id")
    private Destination destination;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "journal_entry", columnDefinition = "TEXT")
    private String journalEntry;

    @Column(name = "memory_date")
    private LocalDate memoryDate;

    @OneToMany(mappedBy = "memory", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Photo> photos = new ArrayList<>();
}
