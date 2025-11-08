package com.gearsync.backend.service;

import com.gearsync.backend.dto.AppointmentSummaryDTO;
import com.gearsync.backend.model.*;
import com.gearsync.backend.repository.AppointmentRepository;
import com.gearsync.backend.repository.UserRepository;
import com.gearsync.backend.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminDashboardServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private AdminDashboardService adminDashboardService;

    private User testCustomer;
    private User testEmployee;
    private Vehicle testVehicle;

    @BeforeEach
    void setUp() {
        testCustomer = new User();
        testCustomer.setId(1L);
        testCustomer.setEmail("customer@example.com");
        testCustomer.setFirstName("John");
        testCustomer.setLastName("Doe");
        testCustomer.setRole(Role.CUSTOMER);

        testEmployee = new User();
        testEmployee.setId(2L);
        testEmployee.setEmail("employee@example.com");
        testEmployee.setFirstName("Jane");
        testEmployee.setLastName("Smith");
        testEmployee.setRole(Role.EMPLOYEE);

        testVehicle = new Vehicle();
        testVehicle.setId(1L);
        testVehicle.setRegistrationNumber("ABC123");
        testVehicle.setMake("Toyota");
        testVehicle.setModel("Camry");
    }

    @Test
    void testGetUserCount_Success() {
        // Given
        when(userRepository.count()).thenReturn(100L);

        // When
        Long result = adminDashboardService.getUserCount();

        // Then
        assertThat(result).isEqualTo(100L);
        verify(userRepository).count();
    }

    @Test
    void testGetUserCount_NoUsers() {
        // Given
        when(userRepository.count()).thenReturn(0L);

        // When
        Long result = adminDashboardService.getUserCount();

        // Then
        assertThat(result).isZero();
        verify(userRepository).count();
    }

    @Test
    void testGetAppointmentCount_Success() {
        // Given
        when(appointmentRepository.count()).thenReturn(50L);

        // When
        Long result = adminDashboardService.getAppointmentCount();

        // Then
        assertThat(result).isEqualTo(50L);
        verify(appointmentRepository).count();
    }

    @Test
    void testGetVehicleCount_Success() {
        // Given
        when(vehicleRepository.count()).thenReturn(75L);

        // When
        Long result = adminDashboardService.getVehicleCount();

        // Then
        assertThat(result).isEqualTo(75L);
        verify(vehicleRepository).count();
    }

    @Test
    void testGetTotalEarningsCompleted_Success() {
        // Given
        BigDecimal expectedEarnings = new BigDecimal("150000.00");
        when(appointmentRepository.sumFinalCostByStatus(AppointmentStatus.COMPLETED))
                .thenReturn(expectedEarnings);

        // When
        BigDecimal result = adminDashboardService.getTotalEarningsCompleted();

        // Then
        assertThat(result).isEqualByComparingTo(expectedEarnings);
        verify(appointmentRepository).sumFinalCostByStatus(AppointmentStatus.COMPLETED);
    }

    @Test
    void testGetTotalEarningsCompleted_NullResult_ReturnsZero() {
        // Given
        when(appointmentRepository.sumFinalCostByStatus(AppointmentStatus.COMPLETED))
                .thenReturn(null);

        // When
        BigDecimal result = adminDashboardService.getTotalEarningsCompleted();

        // Then
        assertThat(result).isEqualByComparingTo(BigDecimal.ZERO);
        verify(appointmentRepository).sumFinalCostByStatus(AppointmentStatus.COMPLETED);
    }

    @Test
    void testGetActiveServiceCountInProgress_Success() {
        // Given
        when(appointmentRepository.countByStatus(AppointmentStatus.IN_PROGRESS)).thenReturn(15L);

        // When
        Long result = adminDashboardService.getActiveServiceCountInProgress();

        // Then
        assertThat(result).isEqualTo(15L);
        verify(appointmentRepository).countByStatus(AppointmentStatus.IN_PROGRESS);
    }

    @Test
    void testGetConfirmedAppointments_Success() {
        // Given
        Appointment appointment1 = createTestAppointment(1L, AppointmentStatus.CONFIRMED);
        Appointment appointment2 = createTestAppointment(2L, AppointmentStatus.CONFIRMED);

        List<Appointment> appointments = Arrays.asList(appointment1, appointment2);
        when(appointmentRepository.findByStatusOrderByScheduledDateTimeAsc(AppointmentStatus.CONFIRMED))
                .thenReturn(appointments);

        // When
        List<AppointmentSummaryDTO> result = adminDashboardService.getConfirmedAppointments();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        assertThat(result.get(0).getStatus()).isEqualTo("CONFIRMED");
        assertThat(result.get(1).getId()).isEqualTo(2L);
        verify(appointmentRepository).findByStatusOrderByScheduledDateTimeAsc(AppointmentStatus.CONFIRMED);
    }

    @Test
    void testGetConfirmedAppointments_NoConfirmed() {
        // Given
        when(appointmentRepository.findByStatusOrderByScheduledDateTimeAsc(AppointmentStatus.CONFIRMED))
                .thenReturn(Collections.emptyList());

        // When
        List<AppointmentSummaryDTO> result = adminDashboardService.getConfirmedAppointments();

        // Then
        assertThat(result).isEmpty();
        verify(appointmentRepository).findByStatusOrderByScheduledDateTimeAsc(AppointmentStatus.CONFIRMED);
    }

    @Test
    void testGetTodayScheduledAppointments_Success() {
        // Given
        Appointment appointment1 = createTestAppointment(1L, AppointmentStatus.CONFIRMED);
        appointment1.setScheduledDateTime(LocalDateTime.now().withHour(10).withMinute(0));
        
        Appointment appointment2 = createTestAppointment(2L, AppointmentStatus.IN_PROGRESS);
        appointment2.setScheduledDateTime(LocalDateTime.now().withHour(14).withMinute(0));

        List<Appointment> appointments = Arrays.asList(appointment1, appointment2);
        
        when(appointmentRepository.findByScheduledDateTimeBetweenOrderByScheduledDateTimeAsc(
                any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(appointments);

        // When
        List<AppointmentSummaryDTO> result = adminDashboardService.getTodayScheduledAppointments();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        assertThat(result.get(1).getId()).isEqualTo(2L);
        verify(appointmentRepository).findByScheduledDateTimeBetweenOrderByScheduledDateTimeAsc(
                any(LocalDateTime.class), any(LocalDateTime.class));
    }

    @Test
    void testGetTodayScheduledAppointments_NoTodayAppointments() {
        // Given
        when(appointmentRepository.findByScheduledDateTimeBetweenOrderByScheduledDateTimeAsc(
                any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());

        // When
        List<AppointmentSummaryDTO> result = adminDashboardService.getTodayScheduledAppointments();

        // Then
        assertThat(result).isEmpty();
        verify(appointmentRepository).findByScheduledDateTimeBetweenOrderByScheduledDateTimeAsc(
                any(LocalDateTime.class), any(LocalDateTime.class));
    }

    @Test
    void testConvertToSummaryDTO_WithAllFields() {
        // Given
        Appointment appointment = createTestAppointment(1L, AppointmentStatus.CONFIRMED);
        appointment.setCustomer(testCustomer);
        appointment.setVehicle(testVehicle);
        appointment.setAssignedEmployee(testEmployee);
        appointment.setProgressPercentage(50);
        appointment.setCreatedAt(LocalDateTime.now().minusDays(1));

        when(appointmentRepository.findByStatusOrderByScheduledDateTimeAsc(AppointmentStatus.CONFIRMED))
                .thenReturn(Collections.singletonList(appointment));

        // When
        List<AppointmentSummaryDTO> result = adminDashboardService.getConfirmedAppointments();

        // Then
        assertThat(result).hasSize(1);
        verify(appointmentRepository).findByStatusOrderByScheduledDateTimeAsc(AppointmentStatus.CONFIRMED);
    }

    @Test
    void testConvertToSummaryDTO_WithNullRelations() {
        // Given
        Appointment appointment = createTestAppointment(1L, AppointmentStatus.CONFIRMED);
        appointment.setCustomer(null);
        appointment.setVehicle(null);
        appointment.setAssignedEmployee(null);

        when(appointmentRepository.findByStatusOrderByScheduledDateTimeAsc(AppointmentStatus.CONFIRMED))
                .thenReturn(Collections.singletonList(appointment));

        // When
        List<AppointmentSummaryDTO> result = adminDashboardService.getConfirmedAppointments();

        // Then
        assertThat(result).hasSize(1);
        AppointmentSummaryDTO dto = result.get(0);
        assertThat(dto.getId()).isEqualTo(1L);
        assertThat(dto.getCustomerName()).isNull();
        assertThat(dto.getCustomerEmail()).isNull();
        assertThat(dto.getVehicleRegistrationNumber()).isNull();
        assertThat(dto.getAssignedEmployeeName()).isNull();
    }

    private Appointment createTestAppointment(Long id, AppointmentStatus status) {
        Appointment appointment = new Appointment();
        appointment.setId(id);
        appointment.setScheduledDateTime(LocalDateTime.now().plusDays(1));
        appointment.setStatus(status);
        appointment.setProgressPercentage(0);
        appointment.setCreatedAt(LocalDateTime.now());
        return appointment;
    }
}
