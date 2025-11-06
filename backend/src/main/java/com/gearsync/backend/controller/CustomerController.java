package com.gearsync.backend.controller;

import com.gearsync.backend.dto.UpdateCustomerProfileDTO;
import com.gearsync.backend.dto.UserDto;
import com.gearsync.backend.exception.ResourceNotFoundException;
import com.gearsync.backend.exception.UnauthorizedException;
import com.gearsync.backend.service.CustomerProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer/profile")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerProfileService profileService;

    @GetMapping
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        try {

            UserDto profile = profileService.getMyProfile(authentication.getName());

            return ResponseEntity.ok(profile);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PutMapping
    public ResponseEntity<?> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateCustomerProfileDTO request) {
        try {

            UserDto updatedProfile = profileService.updateMyProfile(
                    authentication.getName(),
                    request
            );

            return ResponseEntity.ok(updatedProfile);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
