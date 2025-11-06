package com.gearsync.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleInfoDTO {
    private Long id;
    private String registrationNumber;
    private String make;
    private String model;
    private Integer year;
    private String color;
}