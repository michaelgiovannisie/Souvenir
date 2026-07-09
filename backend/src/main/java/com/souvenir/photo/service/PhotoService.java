package com.souvenir.photo.service;

import com.souvenir.common.exception.ForbiddenException;
import com.souvenir.common.exception.ResourceNotFoundException;
import com.souvenir.photo.domain.Photo;
import com.souvenir.photo.dto.PhotoResponse;
import com.souvenir.photo.repository.PhotoRepository;
import com.souvenir.trip.domain.Trip;
import com.souvenir.trip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PhotoService {

    private final PhotoRepository photoRepository;
    private final TripRepository tripRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional(readOnly = true)
    public List<PhotoResponse> getTripPhotos(UUID tripId, String email) {
        Trip trip = getActiveTrip(tripId);
        assertOwnership(trip, email);
        return photoRepository.findAllByTripId(tripId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public PhotoResponse uploadPhoto(UUID tripId, MultipartFile file, String caption, String email) {
        Trip trip = getActiveTrip(tripId);
        assertOwnership(trip, email);

        Map<String, Object> uploadResult = cloudinaryService.uploadPhoto(file, "trips/" + tripId);

        Photo photo = Photo.builder()
                .trip(trip)
                .cloudinaryUrl((String) uploadResult.get("secure_url"))
                .cloudinaryPublicId((String) uploadResult.get("public_id"))
                .caption(caption)
                .build();

        return toResponse(photoRepository.save(photo));
    }

    @Transactional
    public void deletePhoto(UUID photoId, String email) {
        Photo photo = photoRepository.findActiveById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("Photo", photoId));
        assertOwnership(photo.getTrip(), email);

        cloudinaryService.deletePhoto(photo.getCloudinaryPublicId());
        photo.softDelete();
        photoRepository.save(photo);
    }

    private Trip getActiveTrip(UUID tripId) {
        return tripRepository.findActiveById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", tripId));
    }

    private void assertOwnership(Trip trip, String email) {
        if (!trip.getUser().getEmail().equals(email)) {
            throw new ForbiddenException();
        }
    }

    private PhotoResponse toResponse(Photo p) {
        return PhotoResponse.builder()
                .id(p.getId())
                .tripId(p.getTrip().getId())
                .memoryId(p.getMemory() != null ? p.getMemory().getId() : null)
                .destinationId(p.getDestination() != null ? p.getDestination().getId() : null)
                .cloudinaryUrl(p.getCloudinaryUrl())
                .caption(p.getCaption())
                .takenAt(p.getTakenAt())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
