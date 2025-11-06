package com.gearsync.backend.service;

import com.gearsync.backend.model.AppointmentStatus;
import com.gearsync.backend.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmployeeDashboardService {

    private final AppointmentRepository appointmentRepository;

    public Long assignedAppointmentCount(String email) {
        return appointmentRepository.countByAssignedEmployee_Email(email);
    }

    public Long completedAppointmentCount(String email) {
        return appointmentRepository.countByAssignedEmployee_EmailAndStatus(email, AppointmentStatus.COMPLETED);
    }

    public Long inProgressAppointmentCount(String email) {
        return appointmentRepository.countByAssignedEmployee_EmailAndStatus(email, AppointmentStatus.IN_PROGRESS);
    }
}
