package com.gearsync.backend.service;

import com.gearsync.backend.dto.*;
import com.gearsync.backend.exception.*;
import com.gearsync.backend.model.*;
import com.gearsync.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;


import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeTimeLogServiceTest {

    @Mock
    private TimeLogRepository timeLogRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private EmployeeTimeLogService employeeTimeLogService;

    private User employee;
    private Appointment appointment;
    private Project project;
    private TimeLog timeLog;

    @BeforeEach
    void setUp() {
        employee = new User();
        employee.setId(1L);
        employee.setEmail("employee@example.com");
        employee.setFirstName("John");
        employee.setLastName("Doe");
        employee.setRole(Role.EMPLOYEE);
        employee.setIsActive(true);

        User customer = new User();
        customer.setId(2L);
        customer.setEmail("customer@example.com");
        customer.setRole(Role.CUSTOMER);

        Vehicle vehicle = new Vehicle();
        vehicle.setId(1L);
        vehicle.setRegistrationNumber("ABC123");

        appointment = new Appointment();
        appointment.setId(1L);
        appointment.setScheduledDateTime(LocalDateTime.now().minusHours(1));
        appointment.setAssignedEmployee(employee);
        appointment.setCustomer(customer);
        appointment.setVehicle(vehicle);

        project = new Project();
        project.setId(1L);
        project.setProjectName("Engine Repair");
        project.setAssignedEmployee(employee);
        project.setCustomer(customer);
        project.setVehicle(vehicle);

        timeLog = new TimeLog();
        timeLog.setId(1L);
        timeLog.setEmployee(employee);
        timeLog.setAppointment(appointment);
        timeLog.setStartTime(LocalDateTime.now().minusHours(2));
        timeLog.setEndTime(LocalDateTime.now().minusHours(1));
        timeLog.setDurationMinutes(60);
        timeLog.setWorkDescription("Oil change completed");
        timeLog.setNotes("No issues");
        timeLog.setCreatedAt(LocalDateTime.now());
        timeLog.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    void testCreateTimeLog_ForAppointment_Success() {
        // Given
        TimeLogRequestDTO request = new TimeLogRequestDTO();
        request.setAppointmentId(1L);
        request.setStartTime(LocalDateTime.now().minusHours(2));
        request.setEndTime(LocalDateTime.now().minusHours(1));
        request.setWorkDescription("Oil change");
        request.setNotes("Completed successfully");

        when(userRepository.findByEmail(employee.getEmail())).thenReturn(Optional.of(employee));
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(timeLogRepository.save(any(TimeLog.class))).thenReturn(timeLog);

        // When
        TimeLogResponseDTO result = employeeTimeLogService.createTimeLog(employee.getEmail(), request);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(timeLogRepository).save(any(TimeLog.class));
    }

    @Test
    void testCreateTimeLog_ForProject_Success() {
        // Given
        timeLog.setAppointment(null);
        timeLog.setProject(project);

        TimeLogRequestDTO request = new TimeLogRequestDTO();
        request.setProjectId(1L);
        request.setStartTime(LocalDateTime.now().minusHours(2));
        request.setEndTime(LocalDateTime.now().minusHours(1));
        request.setWorkDescription("Engine repair");
        request.setNotes("Progress update");

        when(userRepository.findByEmail(employee.getEmail())).thenReturn(Optional.of(employee));
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(timeLogRepository.save(any(TimeLog.class))).thenReturn(timeLog);

        // When
        TimeLogResponseDTO result = employeeTimeLogService.createTimeLog(employee.getEmail(), request);

        // Then
        assertThat(result).isNotNull();
        verify(timeLogRepository).save(any(TimeLog.class));
    }

    @Test
    void testCreateTimeLog_EmployeeNotFound() {
        // Given
        TimeLogRequestDTO request = new TimeLogRequestDTO();
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> employeeTimeLogService.createTimeLog("unknown@example.com", request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Employee not found");
    }

    @Test
    void testCreateTimeLog_NotEmployee() {
        // Given
        employee.setRole(Role.CUSTOMER);
        TimeLogRequestDTO request = new TimeLogRequestDTO();
        request.setAppointmentId(1L);

        when(userRepository.findByEmail(employee.getEmail())).thenReturn(Optional.of(employee));

        // When/Then
        assertThatThrownBy(() -> employeeTimeLogService.createTimeLog(employee.getEmail(), request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Only employees can log time");
    }

    @Test
    void testCreateTimeLog_BothAppointmentAndProject() {
        // Given
        TimeLogRequestDTO request = new TimeLogRequestDTO();
        request.setAppointmentId(1L);
        request.setProjectId(1L);

        when(userRepository.findByEmail(employee.getEmail())).thenReturn(Optional.of(employee));

        // When/Then
        assertThatThrownBy(() -> employeeTimeLogService.createTimeLog(employee.getEmail(), request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Cannot log time for both appointment and project");
    }

    @Test
    void testCreateTimeLog_NeitherAppointmentNorProject() {
        // Given
        TimeLogRequestDTO request = new TimeLogRequestDTO();
        request.setStartTime(LocalDateTime.now().minusHours(2));
        request.setEndTime(LocalDateTime.now().minusHours(1));

        when(userRepository.findByEmail(employee.getEmail())).thenReturn(Optional.of(employee));

        // When/Then
        assertThatThrownBy(() -> employeeTimeLogService.createTimeLog(employee.getEmail(), request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Either appointmentId or projectId must be provided");
    }

    @Test
    void testCreateTimeLog_EndTimeBeforeStartTime() {
        // Given
        TimeLogRequestDTO request = new TimeLogRequestDTO();
        request.setAppointmentId(1L);
        request.setStartTime(LocalDateTime.now());
        request.setEndTime(LocalDateTime.now().minusHours(1));

        when(userRepository.findByEmail(employee.getEmail())).thenReturn(Optional.of(employee));

        // When/Then
        assertThatThrownBy(() -> employeeTimeLogService.createTimeLog(employee.getEmail(), request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("End time must be after start time");
    }

    @Test
    void testCreateTimeLog_EndTimeInFuture() {
        // Given
        TimeLogRequestDTO request = new TimeLogRequestDTO();
        request.setAppointmentId(1L);
        request.setStartTime(LocalDateTime.now().minusHours(1));
        request.setEndTime(LocalDateTime.now().plusHours(1));

        when(userRepository.findByEmail(employee.getEmail())).thenReturn(Optional.of(employee));

        // When/Then
        assertThatThrownBy(() -> employeeTimeLogService.createTimeLog(employee.getEmail(), request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("End time cannot be in the future");
    }

    @Test
    void testCreateTimeLog_AppointmentNotAssigned() {
        // Given
        appointment.setAssignedEmployee(null);

        TimeLogRequestDTO request = new TimeLogRequestDTO();
        request.setAppointmentId(1L);
        request.setStartTime(LocalDateTime.now().minusHours(2));
        request.setEndTime(LocalDateTime.now().minusHours(1));
        request.setWorkDescription("Work");

        when(userRepository.findByEmail(employee.getEmail())).thenReturn(Optional.of(employee));
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));

        // When/Then
        assertThatThrownBy(() -> employeeTimeLogService.createTimeLog(employee.getEmail(), request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("This appointment is not assigned to you");
    }

    @Test
    void testGetTimeLogsForAppointment_Success() {
        // Given
        when(userRepository.findByEmail(employee.getEmail())).thenReturn(Optional.of(employee));
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(timeLogRepository.findByAppointmentId(1L)).thenReturn(Arrays.asList(timeLog));

        // When
        List<TimeLogResponseDTO> result = employeeTimeLogService.getTimeLogsForAppointment(employee.getEmail(), 1L);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
    }

    @Test
    void testGetTimeLogsForProject_Success() {
        // Given
        timeLog.setAppointment(null);
        timeLog.setProject(project);

        when(userRepository.findByEmail(employee.getEmail())).thenReturn(Optional.of(employee));
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(timeLogRepository.findByProjectId(1L)).thenReturn(Arrays.asList(timeLog));

        // When
        List<TimeLogResponseDTO> result = employeeTimeLogService.getTimeLogsForProject(employee.getEmail(), 1L);

        // Then
        assertThat(result).hasSize(1);
    }

    @Test
    void testGetMyTimeLogs_Success() {
        // Given
        when(userRepository.findByEmail(employee.getEmail())).thenReturn(Optional.of(employee));
        when(timeLogRepository.findByEmployeeId(employee.getId())).thenReturn(Arrays.asList(timeLog));

        // When
        List<TimeLogResponseDTO> result = employeeTimeLogService.getMyTimeLogs(employee.getEmail());

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmployeeEmail()).isEqualTo(employee.getEmail());
    }

    @Test
    void testUpdateTimeLog_Success() {
        // Given
        TimeLogUpdateDTO request = new TimeLogUpdateDTO();
        request.setWorkDescription("Updated description");
        request.setNotes("Updated notes");

        when(userRepository.findByEmail(employee.getEmail())).thenReturn(Optional.of(employee));
        when(timeLogRepository.findById(1L)).thenReturn(Optional.of(timeLog));
        when(timeLogRepository.save(any(TimeLog.class))).thenReturn(timeLog);

        // When
        TimeLogResponseDTO result = employeeTimeLogService.updateTimeLog(employee.getEmail(), 1L, request);

        // Then
        assertThat(result).isNotNull();
        verify(timeLogRepository).save(any(TimeLog.class));
    }

    @Test
    void testUpdateTimeLog_NotOwner() {
        // Given
        User otherEmployee = new User();
        otherEmployee.setId(999L);
        otherEmployee.setEmail("other@example.com");

        timeLog.setEmployee(otherEmployee);

        TimeLogUpdateDTO request = new TimeLogUpdateDTO();
        request.setWorkDescription("Updated");

        when(userRepository.findByEmail(employee.getEmail())).thenReturn(Optional.of(employee));
        when(timeLogRepository.findById(1L)).thenReturn(Optional.of(timeLog));

        // When/Then
        assertThatThrownBy(() -> employeeTimeLogService.updateTimeLog(employee.getEmail(), 1L, request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("You can only edit your own time logs");
    }

    @Test
    void testDeleteTimeLog_Success() {
        // Given
        when(userRepository.findByEmail(employee.getEmail())).thenReturn(Optional.of(employee));
        when(timeLogRepository.findById(1L)).thenReturn(Optional.of(timeLog));
        doNothing().when(timeLogRepository).delete(timeLog);

        // When
        employeeTimeLogService.deleteTimeLog(employee.getEmail(), 1L);

        // Then
        verify(timeLogRepository).delete(timeLog);
    }

    @Test
    void testDeleteTimeLog_NotOwner() {
        // Given
        User otherEmployee = new User();
        otherEmployee.setId(999L);
        timeLog.setEmployee(otherEmployee);

        when(userRepository.findByEmail(employee.getEmail())).thenReturn(Optional.of(employee));
        when(timeLogRepository.findById(1L)).thenReturn(Optional.of(timeLog));

        // When/Then
        assertThatThrownBy(() -> employeeTimeLogService.deleteTimeLog(employee.getEmail(), 1L))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("You can only delete your own time logs");
    }
}
