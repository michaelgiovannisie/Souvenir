package com.souvenir.memory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class MemoryRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @Size(max = 50000, message = "Journal entry must not exceed 50,000 characters")
    private String journalEntry;

    private LocalDate memoryDate;

    private UUID destinationId;
}
