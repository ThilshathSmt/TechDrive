package com.gearsync.backend.service;

import com.gearsync.backend.dto.*;
import com.gearsync.backend.exception.DuplicateResourceException;
import com.gearsync.backend.exception.ResourceNotFoundException;
import com.gearsync.backend.exception.UnauthorizedException;
import com.gearsync.backend.model.*;
import com.gearsync.backend.repository.AppointmentRepository;
import com.gearsync.backend.repository.ProjectRepository;
import com.gearsync.backend.repository.UserRepository;
import com.gearsync.backend.repository.VehicleRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServices {

//    private static final String UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
//    private static final String LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
//    private static final String DIGITS = "0123456789";
//    private static final String SPECIALS = "!@#$%^&*()-_=+[]{}|;:,.<>?";
//    private static final String ALL = UPPERCASE + LOWERCASE + DIGITS + SPECIALS;
//    private static final SecureRandom random = new SecureRandom();


    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordManagementService passwordManagementService;
    private final AppointmentRepository appointmentRepository;
    private final ProjectRepository projectRepository;
    private final VehicleRepository vehicleRepository;


    @Transactional
    public Map<String, Object> addEmployee(EmployeeRegisterDTO employeeRegisterDTO) {
        try {
            if (userRepository.existsByEmail(employeeRegisterDTO.getEmail())) {
                throw new IllegalArgumentException("Email already registered");
            }
            User user = modelMapper.map(employeeRegisterDTO, User.class);
            String generatedPassword = passwordManagementService.generateTemporaryPassword();
            user.setPassword(passwordEncoder.encode(generatedPassword));
            user.setIsFirstLogin(true);
            User savedUser = userRepository.save(user);
            String username = savedUser.getFirstName() + " " + savedUser.getLastName();
            emailService.sendEmployeeWelcomeEmail(savedUser.getEmail(), username, generatedPassword, "Employee");
            Map<String, Object> response = new HashMap<>();
            response.put("user-email", savedUser.getEmail());
            response.put("message", "Employee added successfully");
            return response;
        } catch (DuplicateResourceException e) {
            throw new DuplicateResourceException("User with email " + employeeRegisterDTO.getEmail() + " already exists.");
        }
    }

    @Transactional
    public Map<String, Object> addAdmin(AdminRegisterDTO adminRegisterDTO) {
        try {
            if (userRepository.existsByEmail(adminRegisterDTO.getEmail())) {
                throw new IllegalArgumentException("Email already registered");
            }
            User user = modelMapper.map(adminRegisterDTO, User.class);
            String generatedPassword = passwordManagementService.generateTemporaryPassword();
            user.setPassword(passwordEncoder.encode(generatedPassword));
            user.setIsFirstLogin(true);
            User savedUser = userRepository.save(user);
            String username = savedUser.getFirstName() + savedUser.getLastName();
            emailService.sendEmployeeWelcomeEmail(savedUser.getEmail(), username, generatedPassword, "Admin");
            Map<String, Object> response = new HashMap<>();
            response.put("user-email", savedUser.getEmail());
            response.put("message", "Admin added successfully");
            return response;
        } catch (DuplicateResourceException e) {
            throw new DuplicateResourceException("User with email " + adminRegisterDTO.getEmail() + " already exists.");
        }
    }

    @Transactional
    public AppointmentResponseDTO assignEmployeeToAppointment(
            String adminEmail,
            Long appointmentId,
            AssignAppointmentDTO request) {

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (admin.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can assign employees to appointments");
        }

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));


        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new IllegalStateException("Cannot assign employee to a completed appointment");
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new IllegalStateException("Cannot assign employee to a cancelled appointment");
        }

        User employee = userRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + request.getEmployeeId()));

        if (employee.getRole() != Role.EMPLOYEE && employee.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Selected user is not an employee");
        }

        if (!employee.getIsActive()) {
            throw new IllegalArgumentException("Cannot assign inactive employee");
        }

        appointment.setAssignedEmployee(employee);

        if (appointment.getStatus() == AppointmentStatus.SCHEDULED) {
            appointment.setStatus(AppointmentStatus.CONFIRMED);
        }

        if (request.getFinalCost() != null) {
            appointment.setFinalCost(request.getFinalCost());
        }

        if (request.getAdminNotes() != null && !request.getAdminNotes().isEmpty()) {
            String timestamp = LocalDateTime.now().toString();
            String note = String.format("[%s] Admin: %s", timestamp, request.getAdminNotes());

            String existingNotes = appointment.getEmployeeNotes() != null ?
                    appointment.getEmployeeNotes() : "";
            appointment.setEmployeeNotes(
                    existingNotes.isEmpty() ? note : existingNotes + "\n" + note
            );
        }
        Appointment updated = appointmentRepository.save(appointment);
        String customerEmail = appointment.getCustomer().getEmail();
        String vehicleRegistrationNumber = appointment.getVehicle().getRegistrationNumber();
        String customerName = appointment.getCustomer().getFirstName() + " " + appointment.getCustomer().getLastName();
        BigDecimal finalCost = appointment.getFinalCost() != null ?
                appointment.getFinalCost() : BigDecimal.ZERO;
        LocalDateTime scheduledDateTime = appointment.getScheduledDateTime();
        emailService.sendCustomerAppointmentConfirmation(customerEmail,vehicleRegistrationNumber,customerName,scheduledDateTime,finalCost);
        List<Services> services = new ArrayList<>(appointment.getAppointmentServices());
        return convertAppointmentToResponseDTO(updated, services);
    }


    @Transactional
    public AppointmentResponseDTO reassignAppointmentEmployee(
            String adminEmail,
            Long appointmentId,
            AssignAppointmentDTO request) {

        return assignEmployeeToAppointment(adminEmail, appointmentId, request);
    }


    @Transactional
    public AppointmentResponseDTO unassignAppointmentEmployee(String adminEmail, Long appointmentId) {

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (admin.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can unassign employees");
        }

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (appointment.getStatus() == AppointmentStatus.IN_PROGRESS) {
            throw new IllegalStateException("Cannot unassign employee from appointment in progress");
        }

        appointment.setAssignedEmployee(null);

        if (appointment.getStatus() == AppointmentStatus.CONFIRMED) {
            appointment.setStatus(AppointmentStatus.SCHEDULED);
        }

        Appointment updated = appointmentRepository.save(appointment);

        List<Services> services = new ArrayList<>(appointment.getAppointmentServices());
        return convertAppointmentToResponseDTO(updated, services);
    }


    @Transactional
    public ProjectResponseDTO approveAndAssignProject(
            String adminEmail,
            Long projectId,
            ApproveProjectDTO request) {

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (admin.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can approve projects");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        if (project.getStatus() != ProjectStatus.PENDING) {
            throw new IllegalStateException(
                    "Can only approve projects with PENDING status. Current status: " + project.getStatus()
            );
        }

        User employee = userRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + request.getEmployeeId()));

        if (employee.getRole() != Role.EMPLOYEE && employee.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Selected user is not an employee");
        }

        if (!employee.getIsActive()) {
            throw new IllegalArgumentException("Cannot assign inactive employee");
        }

        project.setStatus(ProjectStatus.APPROVED);
        project.setAssignedEmployee(employee);
        project.setEstimatedCost(request.getEstimatedCost());
        project.setEstimatedDurationHours(request.getEstimatedDurationHours());

        if (request.getExpectedCompletionDate() != null) {
            project.setExpectedCompletionDate(request.getExpectedCompletionDate());
        }

        if (request.getApprovalNotes() != null && !request.getApprovalNotes().isEmpty()) {
            String timestamp = LocalDateTime.now().toString();
            String approvalNote = String.format(
                    "\n\n[%s] APPROVED by Admin - Assigned to: %s %s\n" +
                            "Estimated Cost: $%.2f | Duration: %d hours\n" +
                            "Notes: %s",
                    timestamp,
                    employee.getFirstName(),
                    employee.getLastName(),
                    request.getEstimatedCost(),
                    request.getEstimatedDurationHours(),
                    request.getApprovalNotes()
            );

            project.setDescription(project.getDescription() + approvalNote);
        }

        Project updated = projectRepository.save(project);

        return convertProjectToResponseDTO(updated);
    }


    @Transactional
    public ProjectResponseDTO rejectProject(
            String adminEmail,
            Long projectId,
            RejectProjectDTO request) {


        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (admin.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can reject projects");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (project.getStatus() != ProjectStatus.PENDING) {
            throw new IllegalStateException(
                    "Can only reject projects with PENDING status. Current status: " + project.getStatus()
            );
        }

        project.setStatus(ProjectStatus.REJECTED);

        String timestamp = LocalDateTime.now().toString();
        String rejectionNote = String.format(
                "\n\n[%s] REJECTED by Admin\nReason: %s",
                timestamp,
                request.getRejectionReason()
        );

        project.setDescription(project.getDescription() + rejectionNote);

        Project updated = projectRepository.save(project);

        return convertProjectToResponseDTO(updated);
    }


    @Transactional
    public ProjectResponseDTO assignEmployeeToProject(
            String adminEmail,
            Long projectId,
            AssignProjectDTO request) {


        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (admin.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can assign employees to projects");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (project.getStatus() != ProjectStatus.APPROVED &&
                project.getStatus() != ProjectStatus.IN_PROGRESS &&
                project.getStatus() != ProjectStatus.ON_HOLD) {
            throw new IllegalStateException(
                    "Can only assign employee to APPROVED, IN_PROGRESS, or ON_HOLD projects. " +
                            "Current status: " + project.getStatus()
            );
        }

        User employee = userRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        if (employee.getRole() != Role.EMPLOYEE && employee.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Selected user is not an employee");
        }

        if (!employee.getIsActive()) {
            throw new IllegalArgumentException("Cannot assign inactive employee");
        }

        project.setAssignedEmployee(employee);
        project.setEstimatedCost(request.getEstimatedCost());
        project.setEstimatedDurationHours(request.getEstimatedDurationHours());

        if (request.getAdminNotes() != null && !request.getAdminNotes().isEmpty()) {
            String timestamp = LocalDateTime.now().toString();
            String note = String.format(
                    "\n\n[%s] Assignment Update - Assigned to: %s %s\nNotes: %s",
                    timestamp,
                    employee.getFirstName(),
                    employee.getLastName(),
                    request.getAdminNotes()
            );

            project.setDescription(project.getDescription() + note);
        }

        Project updated = projectRepository.save(project);

        return convertProjectToResponseDTO(updated);
    }


    @Transactional
    public ProjectResponseDTO unassignProjectEmployee(String adminEmail, Long projectId) {

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (admin.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can unassign employees");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (project.getStatus() == ProjectStatus.IN_PROGRESS) {
            throw new IllegalStateException("Cannot unassign employee from project in progress");
        }

        project.setAssignedEmployee(null);

        Project updated = projectRepository.save(project);

        return convertProjectToResponseDTO(updated);
    }

    private AppointmentResponseDTO convertAppointmentToResponseDTO(
            Appointment appointment,
            List<Services> services) {

        AppointmentResponseDTO dto = new AppointmentResponseDTO();
        dto.setId(appointment.getId());
        dto.setScheduledDateTime(appointment.getScheduledDateTime());
        dto.setStatus(appointment.getStatus().name());
        dto.setCustomerNotes(appointment.getCustomerNotes());
        dto.setEmployeeNotes(appointment.getEmployeeNotes());
        dto.setFinalCost(appointment.getFinalCost());
        dto.setProgressPercentage(appointment.getProgressPercentage());

        User customer = appointment.getCustomer();
        dto.setCustomerId(customer.getId());
        dto.setCustomerName(customer.getFirstName() + " " + customer.getLastName());
        dto.setCustomerEmail(customer.getEmail());
        dto.setCustomerPhone(customer.getPhoneNumber());

        Vehicle vehicle = appointment.getVehicle();
        dto.setVehicleId(vehicle.getId());
        dto.setVehicleRegistrationNumber(vehicle.getRegistrationNumber());
        dto.setVehicleMake(vehicle.getMake());
        dto.setVehicleModel(vehicle.getModel());
        dto.setVehicleYear(String.valueOf(vehicle.getYear()));

        List<ServiceSummaryDTO> serviceSummaries = services.stream()
                .map(service -> {
                    ServiceSummaryDTO summary = new ServiceSummaryDTO();
                    summary.setId(service.getId());
                    summary.setServiceName(service.getServiceName());
                    summary.setCategory(service.getCategory().name());
                    summary.setBasePrice(service.getBasePrice());
                    summary.setEstimatedDurationMinutes(service.getEstimatedDurationMinutes());
                    return summary;
                })
                .collect(Collectors.toList());
        dto.setServices(serviceSummaries);

        BigDecimal estimatedCost = services.stream()
                .map(Services::getBasePrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setEstimatedCost(estimatedCost);

        if (appointment.getAssignedEmployee() != null) {
            User employee = appointment.getAssignedEmployee();
            dto.setAssignedEmployeeId(employee.getId());
            dto.setAssignedEmployeeName(employee.getFirstName() + " " + employee.getLastName());
            dto.setAssignedEmployeeEmail(employee.getEmail());
        }

        dto.setActualStartTime(appointment.getActualStartTime());
        dto.setActualEndTime(appointment.getActualEndTime());
        dto.setCreatedAt(appointment.getCreatedAt());
        dto.setUpdatedAt(appointment.getUpdatedAt());

        return dto;
    }

    private ProjectResponseDTO convertProjectToResponseDTO(Project project) {
        ProjectResponseDTO dto = new ProjectResponseDTO();
        dto.setId(project.getId());
        dto.setProjectName(project.getProjectName());
        dto.setDescription(project.getDescription());
        dto.setStatus(project.getStatus().name());
        dto.setEstimatedCost(project.getEstimatedCost());
        dto.setActualCost(project.getActualCost());
        dto.setEstimatedDurationHours(project.getEstimatedDurationHours());
        dto.setStartDate(project.getStartDate());
        dto.setCompletionDate(project.getCompletionDate());
        dto.setExpectedCompletionDate(project.getExpectedCompletionDate());
        dto.setProgressPercentage(project.getProgressPercentage());

        User customer = project.getCustomer();
        dto.setCustomerId(customer.getId());
        dto.setCustomerName(customer.getFirstName() + " " + customer.getLastName());
        dto.setCustomerEmail(customer.getEmail());
        dto.setCustomerPhone(customer.getPhoneNumber());

        Vehicle vehicle = project.getVehicle();
        dto.setVehicleId(vehicle.getId());
        dto.setVehicleRegistrationNumber(vehicle.getRegistrationNumber());
        dto.setVehicleMake(vehicle.getMake());
        dto.setVehicleModel(vehicle.getModel());
        dto.setVehicleYear(String.valueOf(vehicle.getYear()));

        if (project.getAssignedEmployee() != null) {
            User employee = project.getAssignedEmployee();
            dto.setAssignedEmployeeId(employee.getId());
            dto.setAssignedEmployeeName(employee.getFirstName() + " " + employee.getLastName());
            dto.setAssignedEmployeeEmail(employee.getEmail());
        }

        dto.setCreatedAt(project.getCreatedAt());
        dto.setUpdatedAt(project.getUpdatedAt());

        return dto;
    }

    @Transactional
    public List<AppointmentSummaryDTO> getAllAppointments(String adminEmail) {
        validateAdmin(adminEmail);
        List<Appointment> appointments = appointmentRepository.findAll();
        return appointments.stream()
                .map(this::convertToAppointmentSummary)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<AppointmentSummaryDTO> getAppointmentsByStatus(
            String adminEmail,
            String status) {

        validateAdmin(adminEmail);

        try {
            AppointmentStatus appointmentStatus = AppointmentStatus.valueOf(status.toUpperCase());
            List<Appointment> appointments = appointmentRepository.findByStatus(appointmentStatus);

            return appointments.stream()
                    .map(this::convertToAppointmentSummary)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + status +
                    ". Valid statuses: SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW, RESCHEDULED");
        }
    }

    @Transactional
    public List<ProjectSummaryDTO> getAllProjects(String adminEmail) {

        validateAdmin(adminEmail);
        List<Project> projects = projectRepository.findAll();

        return projects.stream()
                .map(this::convertToProjectSummary)
                .collect(Collectors.toList());
    }


    @Transactional
    public List<ProjectSummaryDTO> getProjectsByStatus(
            String adminEmail,
            String status) {

        validateAdmin(adminEmail);

        try {
            ProjectStatus projectStatus = ProjectStatus.valueOf(status.toUpperCase());
            List<Project> projects = projectRepository.findByStatus(projectStatus);

            return projects.stream()
                    .map(this::convertToProjectSummary)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + status +
                    ". Valid statuses: PENDING, APPROVED, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELLED, REJECTED");
        }
    }

    @Transactional
    public List<AppointmentSummaryDTO> getPendingAppointments(String adminEmail) {
        validateAdmin(adminEmail);
        List<Appointment> appointments = appointmentRepository.findByStatus(AppointmentStatus.SCHEDULED);

        return appointments.stream()
                .filter(a -> a.getAssignedEmployee() == null)
                .map(this::convertToAppointmentSummary)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<ProjectSummaryDTO> getPendingProjects(String adminEmail) {

        validateAdmin(adminEmail);

        List<Project> projects = projectRepository.findByStatus(ProjectStatus.PENDING);

        return projects.stream()
                .map(this::convertToProjectSummary)
                .collect(Collectors.toList());
    }


    @Transactional
    public EmployeeDetailDTO getEmployeeDetails(String adminEmail, Long employeeId) {

        validateAdmin(adminEmail);

        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + employeeId));

        if (employee.getRole() != Role.EMPLOYEE && employee.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("User is not an employee");
        }

        List<Appointment> appointments = appointmentRepository.findByAssignedEmployeeId(employeeId);
        List<Project> projects = projectRepository.findByAssignedEmployeeId(employeeId);

        long completedAppointments = appointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                .count();

        long completedProjects = projects.stream()
                .filter(p -> p.getStatus() == ProjectStatus.COMPLETED)
                .count();

        EmployeeDetailDTO dto = new EmployeeDetailDTO();
        dto.setId(employee.getId());
        dto.setEmail(employee.getEmail());
        dto.setFirstName(employee.getFirstName());
        dto.setLastName(employee.getLastName());
        dto.setPhoneNumber(employee.getPhoneNumber());
        dto.setRole(employee.getRole().name());
        dto.setIsActive(employee.getIsActive());
        dto.setIsPasswordChanged(employee.getIsPasswordChanged());
        dto.setLastLoginAt(employee.getLastLoginAt());
        dto.setCreatedAt(employee.getCreatedAt());
        dto.setAssignedAppointmentsCount((long) appointments.size());
        dto.setAssignedProjectsCount((long) projects.size());
        dto.setCompletedAppointmentsCount(completedAppointments);
        dto.setCompletedProjectsCount(completedProjects);

        return dto;
    }


    @Transactional
    public EmployeeDetailDTO updateEmployee(
            String adminEmail,
            Long employeeId,
            UpdateEmployeeDTO request) {


        validateAdmin(adminEmail);

        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + employeeId));

        if (employee.getRole() != Role.EMPLOYEE && employee.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("User is not an employee");
        }

        employee.setFirstName(request.getFirstName().trim());
        employee.setLastName(request.getLastName().trim());
        employee.setPhoneNumber(request.getPhoneNumber().trim());
        employee.setIsActive(request.getIsActive());

        userRepository.save(employee);

        return getEmployeeDetails(adminEmail, employeeId);
    }

    @Transactional
    public List<UserDto> getAllEmployees(String adminEmail) {

        validateAdmin(adminEmail);

        List<User> employees = userRepository.findAllEmployees();

        return employees.stream()
                .map(emp -> {
                    UserDto dto = new UserDto();
                    dto.setId(emp.getId());
                    dto.setName(emp.getFirstName() + " " + emp.getLastName());
                    dto.setEmail(emp.getEmail());
                    dto.setRole(emp.getRole().name());
                    dto.setIsActive(emp.getIsActive());
                    return dto;
                })
                .collect(Collectors.toList());
    }


    @Transactional
    public List<UserDto> getActiveEmployees(String adminEmail) {

        validateAdmin(adminEmail);

        List<User> employees = userRepository.findActiveEmployees();

        return employees.stream()
                .map(emp -> {
                    UserDto dto = new UserDto();
                    dto.setId(emp.getId());
                    dto.setName(emp.getFirstName() + " " + emp.getLastName());
                    dto.setEmail(emp.getEmail());
                    dto.setRole(emp.getRole().name());
                    dto.setIsActive(true);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private void validateAdmin(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can access this resource");
        }
    }

    private AppointmentSummaryDTO convertToAppointmentSummary(Appointment appointment) {
        AppointmentSummaryDTO dto = new AppointmentSummaryDTO();
        dto.setId(appointment.getId());
        dto.setScheduledDateTime(appointment.getScheduledDateTime());
        dto.setStatus(appointment.getStatus().name());
        dto.setCustomerName(appointment.getCustomer().getFirstName() + " " + appointment.getCustomer().getLastName());
        dto.setCustomerEmail(appointment.getCustomer().getEmail());
        dto.setVehicleRegistrationNumber(appointment.getVehicle().getRegistrationNumber());
        dto.setVehicleMake(appointment.getVehicle().getMake());
        dto.setVehicleModel(appointment.getVehicle().getModel());

        if (appointment.getAssignedEmployee() != null) {
            dto.setAssignedEmployeeName(
                    appointment.getAssignedEmployee().getFirstName() + " " +
                            appointment.getAssignedEmployee().getLastName()
            );
        } else {
            dto.setAssignedEmployeeName("Unassigned");
        }

        dto.setProgressPercentage(appointment.getProgressPercentage());
        dto.setCreatedAt(appointment.getCreatedAt());

        return dto;
    }

    private ProjectSummaryDTO convertToProjectSummary(Project project) {
        ProjectSummaryDTO dto = new ProjectSummaryDTO();
        dto.setId(project.getId());
        dto.setProjectName(project.getProjectName());
        dto.setStatus(project.getStatus().name());
        dto.setCustomerName(project.getCustomer().getFirstName() + " " + project.getCustomer().getLastName());
        dto.setCustomerEmail(project.getCustomer().getEmail());
        dto.setVehicleRegistrationNumber(project.getVehicle().getRegistrationNumber());

        if (project.getAssignedEmployee() != null) {
            dto.setAssignedEmployeeName(
                    project.getAssignedEmployee().getFirstName() + " " +
                            project.getAssignedEmployee().getLastName()
            );
        } else {
            dto.setAssignedEmployeeName("Unassigned");
        }

        dto.setEstimatedCost(project.getEstimatedCost());
        dto.setProgressPercentage(project.getProgressPercentage());
        dto.setCreatedAt(project.getCreatedAt());

        return dto;
    }

    @Transactional
    public List<AppointmentResponseDTO> getAllAppointments() {
        List<Appointment> all = appointmentRepository.findAllWithDetails();

        return all.stream()
                .map(a -> {
                    List<Services> services = new ArrayList<>();
                    Set<Services> svcSet = a.getAppointmentServices();
                    if (svcSet != null && !svcSet.isEmpty()) {
                        services = new ArrayList<>(svcSet);
                    }
                    return convertAppointmentToResponseDTO(a, services);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public List<VehicleSummaryDTO> getAllVehicles(String adminEmail) {

        validateAdmin(adminEmail);

        List<Vehicle> vehicles = vehicleRepository.findAll();

        return vehicles.stream()
                .map(this::convertToVehicleSummary)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<CustomerWithVehiclesDTO> getAllCustomersWithVehicles(String adminEmail) {

        validateAdmin(adminEmail);

        List<User> customers = userRepository.findByRole(Role.CUSTOMER);

        return customers.stream()
                .map(this::convertToCustomerWithVehicles)
                .collect(Collectors.toList());
    }

    @Transactional
    public CustomerWithVehiclesDTO getCustomerWithVehicles(String adminEmail, Long customerId) {

        validateAdmin(adminEmail);

        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + customerId));

        if (customer.getRole() != Role.CUSTOMER) {
            throw new IllegalArgumentException("User is not a customer");
        }

        return convertToCustomerWithVehicles(customer);
    }

    private VehicleSummaryDTO convertToVehicleSummary(Vehicle vehicle) {
        VehicleSummaryDTO dto = new VehicleSummaryDTO();
        dto.setId(vehicle.getId());
        dto.setRegistrationNumber(vehicle.getRegistrationNumber());
        dto.setMake(vehicle.getMake());
        dto.setModel(vehicle.getModel());
        dto.setYear(vehicle.getYear());
        dto.setColor(vehicle.getColor());
        dto.setVinNumber(vehicle.getVinNumber());
        dto.setMileage(vehicle.getMileage());

        User owner = vehicle.getOwner();
        dto.setOwnerName(owner.getFirstName() + " " + owner.getLastName());
        dto.setOwnerEmail(owner.getEmail());
        dto.setOwnerPhone(owner.getPhoneNumber());
        dto.setCreatedAt(vehicle.getCreatedAt());

        return dto;
    }

    private CustomerWithVehiclesDTO convertToCustomerWithVehicles(User customer) {
        CustomerWithVehiclesDTO dto = new CustomerWithVehiclesDTO();
        dto.setId(customer.getId());
        dto.setEmail(customer.getEmail());
        dto.setFirstName(customer.getFirstName());
        dto.setLastName(customer.getLastName());
        dto.setPhoneNumber(customer.getPhoneNumber());
        dto.setIsActive(customer.getIsActive());
        dto.setCreatedAt(customer.getCreatedAt());

        List<Vehicle> vehicles = vehicleRepository.findByOwnerId(customer.getId());
        List<VehicleInfoDTO> vehicleInfos = vehicles.stream()
                .map(vehicle -> {
                    VehicleInfoDTO vDto = new VehicleInfoDTO();
                    vDto.setId(vehicle.getId());
                    vDto.setRegistrationNumber(vehicle.getRegistrationNumber());
                    vDto.setMake(vehicle.getMake());
                    vDto.setModel(vehicle.getModel());
                    vDto.setYear(vehicle.getYear());
                    vDto.setColor(vehicle.getColor());
                    return vDto;
                })
                .collect(Collectors.toList());

        dto.setVehicles(vehicleInfos);
        dto.setTotalVehicles(vehicles.size());

        List<Appointment> appointments = appointmentRepository.findByCustomerId(customer.getId());
        List<Project> projects = projectRepository.findByCustomerId(customer.getId());

        dto.setTotalAppointments(appointments.size());
        dto.setTotalProjects(projects.size());

        return dto;
    }
}
