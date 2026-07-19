package com.souvenir.memory.domain;

import com.souvenir.common.entity.BaseEntity;
import com.souvenir.destination.domain.Destination;
import com.souvenir.photo.domain.Photo;
import com.souvenir.trip.domain.Trip;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

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

    @Column(name = "mood", length = 30)
    private String mood;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "memory_tags",
            joinColumns = @JoinColumn(name = "memory_id")
    )
    @Column(name = "tag", length = 50)
    @Builder.Default
    private Set<String> tags = new LinkedHashSet<>();

    @OneToMany(mappedBy = "memory", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Photo> photos = new ArrayList<>();
}
