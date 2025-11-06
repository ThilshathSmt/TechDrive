package com.gearsync.backend.controller;

import com.gearsync.backend.dto.*;
import com.gearsync.backend.exception.ResourceNotFoundException;
import com.gearsync.backend.model.User;
import com.gearsync.backend.repository.UserRepository;
import com.gearsync.backend.security.JwtUtil;
import com.gearsync.backend.service.AuthService;
import com.gearsync.backend.service.EmailService;
import com.gearsync.backend.service.PasswordManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {


    private final AuthService authService;
    private final PasswordManagementService passwordService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @GetMapping("/test")
    public String test() {
        return "AuthController is working!";
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid UserRegisterDTO userRegisterDTO) {

        if (authService.isEmailRegistered(userRegisterDTO.getEmail())) {
            return ResponseEntity.badRequest().body("Email already registered");
        }
        User saved = authService.register(userRegisterDTO);
        String customerName = saved.getFirstName() + " " + saved.getLastName();
        emailService.sendCustomerWelcomeEmail(saved.getEmail(), customerName);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        boolean isAuthenticated = authService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());
        if (!isAuthenticated) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }
        User user = authService.findByEmail(loginRequest.getEmail());
        user.setLastLoginAt(java.time.LocalDateTime.now());
        userRepository.save(user);
        String jwtToken = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return ResponseEntity.ok(Map.of(
                "isFirstLogin", user.getIsFirstLogin(),
                "token", jwtToken,
                "role", user.getRole().name()
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        String email = authentication.getName();
        System.out.println(authentication.getAuthorities());
        User user = authService.findByEmail(email);
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getFirstName() + user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setRole(String.valueOf(user.getRole()));
        dto.setPhoneNumber(user.getPhoneNumber());
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(Authentication authentication) {
        String email = authentication.getName();
        User user = authService.findByEmail(email);
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }


    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequestDTO request) {

        try {
            passwordService.changePassword(authentication.getName(), request);
            return ResponseEntity.ok(Map.of(
                    "message", "Password changed successfully",
                    "success", true
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", e.getMessage(),
                    "success", false
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", "An error occurred while changing the password",
                    "success", false
            ));
        }

    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequestDTO request) {

        try {
            passwordService.initiateForgotPassword(request);
            return ResponseEntity.ok(Map.of(
                    "message", "OTP has been sent to your email. Valid for 10 minutes.",
                    "success", true,
                    "email", request.getEmail()
            ));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", e.getMessage(),
                    "success", false
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", "An error occurred while processing your request",
                    "success", false
            ));
        }

    }

    @PostMapping("/verify-otp")
    public ResponseEntity<VerifyOtpResponseDTO> verifyOtp(
            @Valid @RequestBody VerifyOtpRequestDTO request) {

        VerifyOtpResponseDTO response = passwordService.verifyOtp(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @Valid @RequestBody ResetPasswordRequestDTO request) {

        passwordService.resetPassword(request);
        return ResponseEntity.ok(Map.of(
                "message", "Password has been reset successfully. You can now login with your new password.",
                "success", true
        ));
    }
}