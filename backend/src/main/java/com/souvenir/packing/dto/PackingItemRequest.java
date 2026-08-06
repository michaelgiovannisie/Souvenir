package com.souvenir.packing.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PackingItemRequest {

    @Size(max = 100)
    private String name;

    @Pattern(regexp = "CLOTHES|TOILETRIES|ELECTRONICS|DOCUMENTS|HEALTH|ACCESSORIES|MISC")
    private String category;

    @Min(1)
    @Max(99)
    private Integer quantity;

    private Boolean packed;
}
