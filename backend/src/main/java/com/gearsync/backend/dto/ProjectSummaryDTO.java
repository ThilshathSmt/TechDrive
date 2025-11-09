package com.gearsync.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectSummaryDTO {
    private Long id;
    private String projectName;
    private String description;
    private String status;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private Long customerId;
    private String vehicleRegistrationNumber;
    private String vehicleMake;
    private String vehicleModel;
    private String vehicleYear;
    private Long vehicleId;
    private String assignedEmployeeName;
    private String assignedEmployeeEmail;
    private Long assignedEmployeeId;
    private java.math.BigDecimal estimatedCost;
    private java.math.BigDecimal actualCost;
    private Integer estimatedDurationHours;
    private Integer progressPercentage;
    private LocalDateTime startDate;
    private LocalDateTime completionDate;
    private LocalDateTime expectedCompletionDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Time log information
    private Integer timeLogsCount;
    private Double totalTimeLoggedHours;
}