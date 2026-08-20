package com.souvenir.trip.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TripNotesRequest {
    private String notes; // nullable — null clears the notes
}
