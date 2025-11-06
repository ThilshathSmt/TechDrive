package com.gearsync.backend.repository;

import com.gearsync.backend.model.Appointment;
import com.gearsync.backend.model.AppointmentStatus;
import com.gearsync.backend.model.Services;
import com.gearsync.backend.model.User;
import com.gearsync.backend.service.AppointmentService;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByCustomer(User customer);
    List<Appointment> findByAssignedEmployee(User employee);
    boolean existsByCustomerAndScheduledDateTime(User customer, LocalDateTime scheduledDateTime);

    List<Appointment> findAllByCustomerId(Long customerId);

    @Query("SELECT a FROM Appointment a JOIN FETCH a.appointmentServices WHERE a.id = :appointmentId")
    Optional<Appointment> findByIdWithServices(@Param("appointmentId") Long appointmentId);

    List<Appointment> findByCustomerIdAndStatus(Long customerId, AppointmentStatus status);

    List<Appointment> findByAssignedEmployeeId(Long employeeId);

    List<Appointment> findByStatus(AppointmentStatus status);

    List<Appointment> findByVehicleId(Long vehicleId);

    List<Appointment> findByScheduledDateTimeBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT a FROM Appointment a WHERE a.customer.id = :customerId " +
            "AND a.scheduledDateTime > :currentDateTime " +
            "ORDER BY a.scheduledDateTime ASC")
    List<Appointment> findUpcomingAppointmentsByCustomer(
            @Param("customerId") Long customerId,
            @Param("currentDateTime") LocalDateTime currentDateTime
    );

    @Query("SELECT a FROM Appointment a WHERE a.customer.id = :customerId " +
            "AND a.scheduledDateTime < :currentDateTime " +
            "ORDER BY a.scheduledDateTime DESC")
    List<Appointment> findPastAppointmentsByCustomer(
            @Param("customerId") Long customerId,
            @Param("currentDateTime") LocalDateTime currentDateTime
    );

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM Appointment a " +
            "WHERE a.customer.id = :customerId " +
            "AND a.scheduledDateTime = :scheduledDateTime " +
            "AND a.status NOT IN ('CANCELLED', 'COMPLETED')")
    boolean existsByCustomerAndScheduledDateTime(
            @Param("customerId") Long customerId,
            @Param("scheduledDateTime") LocalDateTime scheduledDateTime
    );

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.customer.id = :customerId " +
            "AND a.status IN ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS')")
    long countActiveAppointmentsByCustomer(@Param("customerId") Long customerId);

    long countByStatus(AppointmentStatus status);

    List<Appointment> findByStatusOrderByScheduledDateTimeAsc(AppointmentStatus status);

    List<Appointment> findByScheduledDateTimeBetweenOrderByScheduledDateTimeAsc(LocalDateTime start, LocalDateTime end);

    @Query("""
           select coalesce(sum(a.finalCost), 0)
           from Appointment a
           where a.status = :status
           """)
    BigDecimal sumFinalCostByStatus(AppointmentStatus status);


    long countByCustomer_Email(String email);

    long countByCustomer_EmailAndStatus(String email, AppointmentStatus status);

    @Query("select coalesce(sum(a.finalCost), 0) from Appointment a where a.customer.email = :email and a.status = com.gearsync.backend.model.AppointmentStatus.COMPLETED")
    BigDecimal sumSpentByCustomerCompleted(String email);

    List<Appointment> findAllByCustomerIdAndScheduledDateTimeGreaterThanEqualOrderByScheduledDateTimeAsc(
            Long customerId, LocalDateTime scheduledFrom);

     @Query("""
        select distinct a
        from Appointment a
        left join fetch a.customer c
        left join fetch a.vehicle v
        left join fetch a.assignedEmployee e
        left join fetch a.appointmentServices s
        order by a.createdAt desc
    """)
    List<Appointment> findAllWithDetails();

    List<Appointment> findByCustomerId(Long customerId);

    Long countByAssignedEmployee_Email(String email);

    Long countByAssignedEmployee_EmailAndStatus(String email, AppointmentStatus status);
}
