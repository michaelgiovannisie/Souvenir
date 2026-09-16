package com.souvenir.trip.dto;

import com.souvenir.trip.domain.TripStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
public class TripRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;

    private LocalDate startDate;
    private LocalDate endDate;
    private TripStatus status;

    /** Optional list of tags, e.g. ["beach", "solo", "backpacking"]. */
    private List<@Size(max = 50) String> tags = new ArrayList<>();
}
