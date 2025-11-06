package com.gearsync.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDetailDTO {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String role;
    private Boolean isActive;
    private Boolean isPasswordChanged;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;

    private Long assignedAppointmentsCount;
    private Long assignedProjectsCount;
    private Long completedAppointmentsCount;
    private Long completedProjectsCount;
}