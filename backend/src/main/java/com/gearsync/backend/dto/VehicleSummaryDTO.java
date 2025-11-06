package com.gearsync.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleSummaryDTO {
    private Long id;
    private String registrationNumber;
    private String make;
    private String model;
    private Integer year;
    private String color;
    private String vinNumber;
    private Integer mileage;
    private String ownerName;
    private String ownerEmail;
    private String ownerPhone;
    private LocalDateTime createdAt;
}