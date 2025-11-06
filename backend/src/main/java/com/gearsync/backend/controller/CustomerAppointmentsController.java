package com.gearsync.backend.controller;

import com.gearsync.backend.dto.AppointmentRequestDTO;
import com.gearsync.backend.dto.AppointmentResponseDTO;
import com.gearsync.backend.dto.MyAppointmentDTO;
import com.gearsync.backend.dto.UpdateAppointmentRequestDTO;
import com.gearsync.backend.exception.*;
import com.gearsync.backend.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/customer/appointments")
public class CustomerAppointmentsController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<?> bookAppointment(
            Authentication authentication,
            @Valid @RequestBody AppointmentRequestDTO request) {

        try {
            String email = authentication.getName();
            AppointmentResponseDTO appointmentResponseDTO = appointmentService.bookAppointment(email, request);
            return ResponseEntity.ok(appointmentResponseDTO);
        } catch (UserNotFoundException | VehicleNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (DuplicateResourceException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<MyAppointmentDTO>> getMyAppointments(Authentication authentication) {
        try {
            List<MyAppointmentDTO> response = appointmentService.getMyAppointments(authentication.getName());
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

    }

    @GetMapping("/{id}")
    public ResponseEntity<MyAppointmentDTO> getAppointmentById(
            Authentication authentication,
            @PathVariable Long id) {
        try {
            String email = authentication.getName();
            MyAppointmentDTO appointmentDTO = appointmentService.getAppointmentById(email, id);
            return ResponseEntity.ok(appointmentDTO);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAppointment(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpdateAppointmentRequestDTO request) {

        try {
            UpdateAppointmentRequestDTO response = appointmentService.updateAppointment(
                    authentication.getName(),
                    id,
                    request
            );

            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException | UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (DuplicateResourceException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(
            Authentication authentication,
            @PathVariable Long id) {

        try {
            AppointmentResponseDTO response = appointmentService.cancelAppointment(
                    authentication.getName(),
                    id);
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException | UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAppointment(
            Authentication authentication,
            @PathVariable Long id) {

        try {
            appointmentService.deleteAppointment(authentication.getName(), id);
            return ResponseEntity.noContent().build();
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }
}
