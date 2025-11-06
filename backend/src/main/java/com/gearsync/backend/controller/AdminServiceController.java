package com.gearsync.backend.controller;

import com.gearsync.backend.dto.ServiceDTO;
import com.gearsync.backend.exception.DuplicateResourceException;
import com.gearsync.backend.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/services")
public class AdminServiceController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<?> addService(Authentication authentication, @Valid @RequestBody ServiceDTO serviceDTO){
        try{
            taskService.newServiceAdd(serviceDTO);
            return ResponseEntity.ok("Service Update Successful.");
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        catch (DuplicateResourceException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
