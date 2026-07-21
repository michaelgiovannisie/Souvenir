package com.souvenir.trip.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CoverPhotoRequest {

    @NotNull(message = "Photo ID is required")
    private UUID photoId;
}
