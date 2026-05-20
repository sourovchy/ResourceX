package com.thirdhand.campusvault.controller;

import com.thirdhand.campusvault.dto.request.OtpRequest;
import com.thirdhand.campusvault.dto.request.OtpVerifyRequest;
import com.thirdhand.campusvault.dto.response.OtpResponse;
import com.thirdhand.campusvault.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/otp")
@RequiredArgsConstructor
public class OtpController {

    private final OtpService otpService;

    @PostMapping("/request")
    public ResponseEntity<OtpResponse> requestOtp(
            @Valid @RequestBody OtpRequest request
    ) {
        OtpResponse response = otpService.sendOtp(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend")
    public ResponseEntity<OtpResponse> resendOtp(
            @Valid @RequestBody OtpRequest request
    ) {
        OtpResponse response = otpService.resendOtp(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<OtpResponse> verifyOtp(
            @Valid @RequestBody OtpVerifyRequest request
    ) {
        OtpResponse response = otpService.verifyOtp(request);
        return ResponseEntity.ok(response);
    }
}