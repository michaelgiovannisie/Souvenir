package com.souvenir.bucketlist.domain;

import com.souvenir.auth.domain.User;
import com.souvenir.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "bucket_list_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BucketListItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "destination_name", nullable = false, length = 200)
    private String destinationName;

    @Column(nullable = false, length = 100)
    private String country;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_completed", nullable = false)
    @Builder.Default
    private boolean completed = false;

    @Column(name = "completed_at")
    private Instant completedAt;

    public void markCompleted() {
        this.completed = true;
        this.completedAt = Instant.now();
    }

    public void markIncomplete() {
        this.completed = false;
        this.completedAt = null;
    }
}
