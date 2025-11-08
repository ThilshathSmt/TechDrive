package com.gearsync.backend.service;

import com.gearsync.backend.dto.AppointmentSummaryDTO;
import com.gearsync.backend.model.Appointment;
import com.gearsync.backend.model.AppointmentStatus;
import com.gearsync.backend.repository.AppointmentRepository;
import com.gearsync.backend.repository.UserRepository;
import com.gearsync.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final VehicleRepository vehicleRepository;

    @Transactional(readOnly = true)
    public Long getUserCount() {
        return userRepository.count();
    }

    @Transactional(readOnly = true)
    public Long getAppointmentCount() {
        return appointmentRepository.count();
    }

    @Transactional(readOnly = true)
    public Long getVehicleCount() {
        return vehicleRepository.count();
    }

    @Transactional(readOnly = true)
    public BigDecimal getTotalEarningsCompleted() {
        BigDecimal result = appointmentRepository.sumFinalCostByStatus(AppointmentStatus.COMPLETED);
        return result != null ? result : BigDecimal.ZERO;
    }

    @Transactional(readOnly = true)
    public Long getActiveServiceCountInProgress() {
        return appointmentRepository.countByStatus(AppointmentStatus.IN_PROGRESS);
    }

    @Transactional(readOnly = true)
    public List<AppointmentSummaryDTO> getConfirmedAppointments() {
        List<Appointment> appointments = appointmentRepository.findByStatusOrderByScheduledDateTimeAsc(AppointmentStatus.CONFIRMED);
        return appointments.stream()
                .map(this::convertToSummaryDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentSummaryDTO> getTodayScheduledAppointments() {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay().minusNanos(1);
        List<Appointment> appointments = appointmentRepository.findByScheduledDateTimeBetweenOrderByScheduledDateTimeAsc(start, end);
        return appointments.stream()
                .map(this::convertToSummaryDTO)
                .collect(Collectors.toList());
    }

    private AppointmentSummaryDTO convertToSummaryDTO(Appointment appointment) {
        AppointmentSummaryDTO dto = new AppointmentSummaryDTO();
        dto.setId(appointment.getId());
        dto.setScheduledDateTime(appointment.getScheduledDateTime());
        dto.setStatus(appointment.getStatus().name());
        dto.setProgressPercentage(appointment.getProgressPercentage());
        dto.setCreatedAt(appointment.getCreatedAt());
        
        if (appointment.getCustomer() != null) {
            dto.setCustomerName(appointment.getCustomer().getFirstName() + " " + appointment.getCustomer().getLastName());
            dto.setCustomerEmail(appointment.getCustomer().getEmail());
        }
        
        if (appointment.getVehicle() != null) {
            dto.setVehicleRegistrationNumber(appointment.getVehicle().getRegistrationNumber());
            dto.setVehicleMake(appointment.getVehicle().getMake());
            dto.setVehicleModel(appointment.getVehicle().getModel());
        }
        
        if (appointment.getAssignedEmployee() != null) {
            dto.setAssignedEmployeeName(appointment.getAssignedEmployee().getFirstName() + " " + appointment.getAssignedEmployee().getLastName());
        }
        
        return dto;
    }
}
