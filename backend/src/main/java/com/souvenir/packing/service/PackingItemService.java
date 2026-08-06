package com.souvenir.packing.service;

import com.souvenir.common.exception.BadRequestException;
import com.souvenir.common.exception.ForbiddenException;
import com.souvenir.common.exception.ResourceNotFoundException;
import com.souvenir.packing.domain.PackingCategory;
import com.souvenir.packing.domain.PackingItem;
import com.souvenir.packing.dto.PackingItemRequest;
import com.souvenir.packing.dto.PackingItemResponse;
import com.souvenir.packing.repository.PackingItemRepository;
import com.souvenir.trip.domain.Trip;
import com.souvenir.trip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PackingItemService {

    private final PackingItemRepository packingItemRepository;
    private final TripRepository tripRepository;

    @Transactional(readOnly = true)
    public List<PackingItemResponse> getByTrip(UUID tripId, String email) {
        Trip trip = getActiveTrip(tripId);
        assertOwnership(trip, email);
        return packingItemRepository.findAllByTripId(tripId)
                .stream().map(PackingItemResponse::from).toList();
    }

    @Transactional
    public PackingItemResponse addItem(UUID tripId, PackingItemRequest request, String email) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Item name is required");
        }
        Trip trip = getActiveTrip(tripId);
        assertOwnership(trip, email);

        PackingItem item = PackingItem.builder()
                .trip(trip)
                .name(request.getName().trim())
                .category(request.getCategory() != null ? PackingCategory.valueOf(request.getCategory()) : null)
                .quantity(request.getQuantity() != null ? request.getQuantity() : 1)
                .packed(request.getPacked() != null && request.getPacked())
                .build();

        return PackingItemResponse.from(packingItemRepository.save(item));
    }

    @Transactional
    public PackingItemResponse updateItem(UUID itemId, PackingItemRequest request, String email) {
        PackingItem item = getActiveItem(itemId);
        assertOwnership(item.getTrip(), email);

        if (request.getName() != null && !request.getName().isBlank()) {
            item.setName(request.getName().trim());
        }
        if (request.getCategory() != null) {
            item.setCategory(PackingCategory.valueOf(request.getCategory()));
        }
        if (request.getQuantity() != null) {
            item.setQuantity(request.getQuantity());
        }
        if (request.getPacked() != null) {
            item.setPacked(request.getPacked());
        }

        return PackingItemResponse.from(packingItemRepository.save(item));
    }

    @Transactional
    public void deleteItem(UUID itemId, String email) {
        PackingItem item = getActiveItem(itemId);
        assertOwnership(item.getTrip(), email);
        item.softDelete();
        packingItemRepository.save(item);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Trip getActiveTrip(UUID id) {
        return tripRepository.findById(id)
                .filter(t -> t.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", id));
    }

    private PackingItem getActiveItem(UUID id) {
        return packingItemRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PackingItem", id));
    }

    private void assertOwnership(Trip trip, String email) {
        if (!trip.getUser().getEmail().equals(email)) {
            throw new ForbiddenException();
        }
    }
}
