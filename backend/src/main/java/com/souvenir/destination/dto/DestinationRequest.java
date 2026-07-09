package com.souvenir.destination.dto;

import com.souvenir.destination.domain.DestinationType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class DestinationRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 200, message = "Name must not exceed 200 characters")
    private String name;

    @NotBlank(message = "Country is required")
    @Size(max = 100, message = "Country must not exceed 100 characters")
    private String country;

    @Size(max = 100)
    private String stateProvince;

    @Size(max = 100)
    private String city;

    @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0")
    private BigDecimal latitude;

    @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0")
    private BigDecimal longitude;

    private DestinationType type;

    private LocalDate arrivalDate;
    private LocalDate departureDate;

    @Size(max = 5000)
    private String notes;

    @Min(1) @Max(5)
    private Short rating;
}
