package com.gearsync.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentSummaryDTO {
    private Long id;
    private LocalDateTime scheduledDateTime;
    private String status;
    private String customerName;
    private String customerEmail;
    private String vehicleRegistrationNumber;
    private String vehicleMake;
    private String vehicleModel;
    private String assignedEmployeeName;
    private Integer progressPercentage;
    private LocalDateTime createdAt;
}