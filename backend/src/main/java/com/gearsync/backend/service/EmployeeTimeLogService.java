package com.gearsync.backend.service;

import com.gearsync.backend.dto.*;
import com.gearsync.backend.exception.*;
import com.gearsync.backend.model.*;
import com.gearsync.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeTimeLogService {

    private final TimeLogRepository timeLogRepository;
    private final AppointmentRepository appointmentRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional
    public TimeLogResponseDTO createTimeLog(String employeeEmail, TimeLogRequestDTO request) {

        User employee = userRepository.findByEmail(employeeEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        if (employee.getRole() != Role.EMPLOYEE && employee.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only employees can log time");
        }

        if (request.getAppointmentId() == null && request.getProjectId() == null) {
            throw new IllegalArgumentException("Either appointmentId or projectId must be provided");
        }

        if (request.getAppointmentId() != null && request.getProjectId() != null) {
            throw new IllegalArgumentException("Cannot log time for both appointment and project simultaneously");
        }

        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        if (request.getEndTime().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("End time cannot be in the future");
        }


        TimeLog timeLog = new TimeLog();
        timeLog.setEmployee(employee);
        timeLog.setStartTime(request.getStartTime());
        timeLog.setEndTime(request.getEndTime());
        timeLog.setWorkDescription(request.getWorkDescription().trim());
        timeLog.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);

        long minutes = Duration.between(request.getStartTime(), request.getEndTime()).toMinutes();
        timeLog.setDurationMinutes((int) minutes);

        if (request.getAppointmentId() != null) {
            Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Appointment not found with ID: " + request.getAppointmentId()
                    ));

            if (appointment.getAssignedEmployee() == null ||
                    !appointment.getAssignedEmployee().getId().equals(employee.getId())) {
                throw new UnauthorizedException("This appointment is not assigned to you");
            }
            if(appointment.getScheduledDateTime().isBefore(request.getStartTime())){
                throw new IllegalArgumentException("Cannot log time for an appointment that has not yet occurred");
            }

            timeLog.setAppointment(appointment);
        } else {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Project not found with ID: " + request.getProjectId()
                    ));

            if (project.getAssignedEmployee() == null ||
                    !project.getAssignedEmployee().getId().equals(employee.getId())) {
                throw new UnauthorizedException("This project is not assigned to you");
            }

            timeLog.setProject(project);
        }

        TimeLog savedTimeLog = timeLogRepository.save(timeLog);
        return convertToResponseDTO(savedTimeLog);
    }

    @Transactional(readOnly = true)
    public List<TimeLogResponseDTO> getTimeLogsForAppointment(String employeeEmail, Long appointmentId) {

        User employee = userRepository.findByEmail(employeeEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (appointment.getAssignedEmployee() == null ||
                !appointment.getAssignedEmployee().getId().equals(employee.getId())) {
            throw new UnauthorizedException("This appointment is not assigned to you");
        }

        List<TimeLog> timeLogs = timeLogRepository.findByAppointmentId(appointmentId);

        return timeLogs.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TimeLogResponseDTO> getTimeLogsForProject(String employeeEmail, Long projectId) {

        User employee = userRepository.findByEmail(employeeEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (project.getAssignedEmployee() == null ||
                !project.getAssignedEmployee().getId().equals(employee.getId())) {
            throw new UnauthorizedException("This project is not assigned to you");
        }

        List<TimeLog> timeLogs = timeLogRepository.findByProjectId(projectId);

        return timeLogs.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TimeLogResponseDTO> getMyTimeLogs(String employeeEmail) {

        User employee = userRepository.findByEmail(employeeEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        List<TimeLog> timeLogs = timeLogRepository.findByEmployeeId(employee.getId());

        return timeLogs.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }


    @Transactional
    public TimeLogResponseDTO updateTimeLog(String employeeEmail, Long timeLogId, TimeLogUpdateDTO request) {

        User employee = userRepository.findByEmail(employeeEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        TimeLog timeLog = timeLogRepository.findById(timeLogId)
                .orElseThrow(() -> new ResourceNotFoundException("Time log not found with ID: " + timeLogId));

        if (!timeLog.getEmployee().getId().equals(employee.getId())) {
            throw new UnauthorizedException("You can only edit your own time logs");
        }

        boolean isUpdated = false;

        if (request.getStartTime() != null) {
            if (request.getStartTime().isAfter(LocalDateTime.now())) {
                throw new IllegalArgumentException("Start time cannot be in the future");
            }
            timeLog.setStartTime(request.getStartTime());
            isUpdated = true;
        }

        if (request.getEndTime() != null) {
            if (request.getEndTime().isAfter(LocalDateTime.now())) {
                throw new IllegalArgumentException("End time cannot be in the future");
            }
            timeLog.setEndTime(request.getEndTime());
            isUpdated = true;
        }

        if (timeLog.getEndTime().isBefore(timeLog.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        long minutes = Duration.between(timeLog.getStartTime(), timeLog.getEndTime()).toMinutes();
        timeLog.setDurationMinutes((int) minutes);


        if (request.getWorkDescription() != null && !request.getWorkDescription().isEmpty()) {
            timeLog.setWorkDescription(request.getWorkDescription().trim());
            isUpdated = true;
        }

        if (request.getNotes() != null) {
            timeLog.setNotes(request.getNotes().trim());
            isUpdated = true;
        }

        if (!isUpdated) {
            throw new IllegalArgumentException("No valid fields provided for update");
        }

        TimeLog updated = timeLogRepository.save(timeLog);

        return convertToResponseDTO(updated);
    }


    @Transactional
    public void deleteTimeLog(String employeeEmail, Long timeLogId) {

        User employee = userRepository.findByEmail(employeeEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        TimeLog timeLog = timeLogRepository.findById(timeLogId)
                .orElseThrow(() -> new ResourceNotFoundException("Time log not found with ID: " + timeLogId));

        if (!timeLog.getEmployee().getId().equals(employee.getId())) {
            throw new UnauthorizedException("You can only delete your own time logs");
        }

        timeLogRepository.delete(timeLog);
    }


    private TimeLogResponseDTO convertToResponseDTO(TimeLog timeLog) {
        TimeLogResponseDTO dto = new TimeLogResponseDTO();
        dto.setId(timeLog.getId());
        dto.setStartTime(timeLog.getStartTime());
        dto.setEndTime(timeLog.getEndTime());
        dto.setDurationMinutes(timeLog.getDurationMinutes());
        dto.setWorkDescription(timeLog.getWorkDescription());
        dto.setNotes(timeLog.getNotes());

        User employee = timeLog.getEmployee();
        dto.setEmployeeId(employee.getId());
        dto.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());
        dto.setEmployeeEmail(employee.getEmail());

        if (timeLog.getAppointment() != null) {
            Appointment appointment = timeLog.getAppointment();
            dto.setAppointmentId(appointment.getId());
            dto.setAppointmentDescription(
                    "Appointment #" + appointment.getId() + " - " +
                            appointment.getVehicle().getRegistrationNumber()
            );
        }

        if (timeLog.getProject() != null) {
            Project project = timeLog.getProject();
            dto.setProjectId(project.getId());
            dto.setProjectName(project.getProjectName());
        }

        dto.setCreatedAt(timeLog.getCreatedAt());
        dto.setUpdatedAt(timeLog.getUpdatedAt());

        return dto;
    }
}