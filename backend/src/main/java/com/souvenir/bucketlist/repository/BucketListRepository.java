package com.souvenir.bucketlist.repository;

import com.souvenir.bucketlist.domain.BucketListItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BucketListRepository extends JpaRepository<BucketListItem, UUID> {

    @Query("SELECT b FROM BucketListItem b WHERE b.user.id = :userId AND b.deletedAt IS NULL")
    Page<BucketListItem> findAllByUserId(UUID userId, Pageable pageable);

    @Query("SELECT b FROM BucketListItem b WHERE b.id = :id AND b.deletedAt IS NULL")
    Optional<BucketListItem> findActiveById(UUID id);
}
