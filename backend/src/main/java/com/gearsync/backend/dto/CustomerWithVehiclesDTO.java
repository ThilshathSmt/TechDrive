package com.gearsync.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerWithVehiclesDTO {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private Boolean isActive;
    private LocalDateTime createdAt;

    private List<VehicleInfoDTO> vehicles;

    private Integer totalVehicles;
    private Integer totalAppointments;
    private Integer totalProjects;
}

