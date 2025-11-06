package com.gearsync.backend.controller;

import com.gearsync.backend.dto.ServiceResponseDTO;
import com.gearsync.backend.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/service/view")
public class ServiceController {

    private final TaskService taskService;

    @GetMapping("/all")
    public ResponseEntity<List<ServiceResponseDTO>> viewAllServices(){
            return ResponseEntity.ok(taskService.getAllServiceDetails());
    }
}
