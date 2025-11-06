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
    private String status;
    private String customerName;
    private String customerEmail;
    private String vehicleRegistrationNumber;
    private String assignedEmployeeName;
    private java.math.BigDecimal estimatedCost;
    private Integer progressPercentage;
    private LocalDateTime createdAt;
}