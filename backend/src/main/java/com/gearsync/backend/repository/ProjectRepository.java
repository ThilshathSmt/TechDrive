package com.gearsync.backend.repository;

import com.gearsync.backend.model.Project;
import com.gearsync.backend.model.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    // Find all projects by customer
    List<Project> findByCustomerId(Long customerId);

    // Find projects by customer and status
    List<Project> findByCustomerIdAndStatus(Long customerId, ProjectStatus status);

    // Find all projects by assigned employee
    List<Project> findByAssignedEmployeeId(Long employeeId);

    // Find all projects by status
    List<Project> findByStatus(ProjectStatus status);

    // Find projects by vehicle
    List<Project> findByVehicleId(Long vehicleId);

    // Find active projects for a customer (PENDING, APPROVED, IN_PROGRESS)
    @Query("SELECT p FROM Project p WHERE p.customer.id = :customerId " +
            "AND p.status IN ('PENDING', 'APPROVED', 'IN_PROGRESS', 'ON_HOLD') " +
            "ORDER BY p.createdAt DESC")
    List<Project> findActiveProjectsByCustomer(@Param("customerId") Long customerId);

    // Find completed projects for a customer
    @Query("SELECT p FROM Project p WHERE p.customer.id = :customerId " +
            "AND p.status = 'COMPLETED' " +
            "ORDER BY p.completionDate DESC")
    List<Project> findCompletedProjectsByCustomer(@Param("customerId") Long customerId);

    // Find projects created between dates
    List<Project> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    // Count active projects for a customer
    @Query("SELECT COUNT(p) FROM Project p WHERE p.customer.id = :customerId " +
            "AND p.status IN ('PENDING', 'APPROVED', 'IN_PROGRESS', 'ON_HOLD')")
    long countActiveProjectsByCustomer(@Param("customerId") Long customerId);

    // Count pending projects (awaiting approval)
    @Query("SELECT COUNT(p) FROM Project p WHERE p.status = 'PENDING'")
    long countPendingProjects();

    // Find projects by customer and vehicle
    List<Project> findByCustomerIdAndVehicleId(Long customerId, Long vehicleId);

    // Find all projects with timeLogs eagerly loaded
    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN FETCH p.timeLogs")
    List<Project> findAllWithTimeLogs();

    // Find projects by status with timeLogs eagerly loaded
    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN FETCH p.timeLogs WHERE p.status = :status")
    List<Project> findByStatusWithTimeLogs(@Param("status") ProjectStatus status);
}