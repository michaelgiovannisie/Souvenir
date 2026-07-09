package com.souvenir.bucketlist.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BucketListRequest {

    @NotBlank(message = "Destination name is required")
    @Size(max = 200)
    private String destinationName;

    @NotBlank(message = "Country is required")
    @Size(max = 100)
    private String country;

    @Size(max = 5000)
    private String notes;
}
