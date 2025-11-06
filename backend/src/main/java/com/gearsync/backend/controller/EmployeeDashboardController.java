package com.gearsync.backend.controller;

import com.gearsync.backend.service.EmployeeDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/employee/dashboard")
public class EmployeeDashboardController {

    private final EmployeeDashboardService employeeDashboardService;

    @GetMapping("/assigned/appointment/count")
    public ResponseEntity<?> assignedAppointmentCount(Authentication authentication) {
        try{
            return ResponseEntity.ok(employeeDashboardService.assignedAppointmentCount(authentication.getName()));
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/completed/appointment/count")
    public ResponseEntity<?> completedAppointmentCount(Authentication authentication) {
        try{
            return ResponseEntity.ok(employeeDashboardService.completedAppointmentCount(authentication.getName()));
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/ongoing/appointment/count")
    public ResponseEntity<?> inProgressAppointmentCount(Authentication authentication) {
        try{
            return ResponseEntity.ok(employeeDashboardService.inProgressAppointmentCount(authentication.getName()));
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
