package com.souvenir.bucketlist.service;

import com.souvenir.auth.domain.User;
import com.souvenir.auth.repository.UserRepository;
import com.souvenir.bucketlist.domain.BucketListItem;
import com.souvenir.bucketlist.dto.BucketListRequest;
import com.souvenir.bucketlist.dto.BucketListResponse;
import com.souvenir.bucketlist.repository.BucketListRepository;
import com.souvenir.common.exception.ForbiddenException;
import com.souvenir.common.exception.ResourceNotFoundException;
import com.souvenir.common.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BucketListService {

    private final BucketListRepository bucketListRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PageResponse<BucketListResponse> getUserBucketList(String email, int page, int size) {
        User user = getUserByEmail(email);
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return PageResponse.from(bucketListRepository.findAllByUserId(user.getId(), pageable).map(this::toResponse));
    }

    @Transactional
    public BucketListResponse addItem(BucketListRequest request, String email) {
        User user = getUserByEmail(email);
        BucketListItem item = BucketListItem.builder()
                .user(user)
                .destinationName(request.getDestinationName())
                .country(request.getCountry())
                .notes(request.getNotes())
                .build();
        return toResponse(bucketListRepository.save(item));
    }

    @Transactional
    public BucketListResponse toggleComplete(UUID itemId, String email) {
        BucketListItem item = getActiveItem(itemId);
        assertOwnership(item, email);
        if (item.isCompleted()) item.markIncomplete();
        else item.markCompleted();
        return toResponse(bucketListRepository.save(item));
    }

    @Transactional
    public void deleteItem(UUID itemId, String email) {
        BucketListItem item = getActiveItem(itemId);
        assertOwnership(item, email);
        item.softDelete();
        bucketListRepository.save(item);
    }

    private BucketListItem getActiveItem(UUID id) {
        return bucketListRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BucketListItem", id));
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", email));
    }

    private void assertOwnership(BucketListItem item, String email) {
        if (!item.getUser().getEmail().equals(email)) throw new ForbiddenException();
    }

    private BucketListResponse toResponse(BucketListItem item) {
        return BucketListResponse.builder()
                .id(item.getId())
                .destinationName(item.getDestinationName())
                .country(item.getCountry())
                .notes(item.getNotes())
                .completed(item.isCompleted())
                .completedAt(item.getCompletedAt())
                .createdAt(item.getCreatedAt())
                .build();
    }
}
