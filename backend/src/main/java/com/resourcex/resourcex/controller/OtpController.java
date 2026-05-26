package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.request.OtpRequest;
import com.resourcex.resourcex.dto.request.OtpVerifyRequest;
import com.resourcex.resourcex.dto.response.OtpResponse;
import com.resourcex.resourcex.entity.TokenPurpose;
import com.resourcex.resourcex.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
        OtpResponse response = otpService.sendOtp(request, TokenPurpose.EMAIL_VERIFICATION);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend")
    public ResponseEntity<OtpResponse> resendOtp(
            @Valid @RequestBody OtpRequest request
    ) {
        OtpResponse response = otpService.resendOtp(request, TokenPurpose.EMAIL_VERIFICATION);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<OtpResponse> verifyOtp(
            @Valid @RequestBody OtpVerifyRequest request
    ) {
        OtpResponse response = otpService.verifyOtp(request, TokenPurpose.EMAIL_VERIFICATION);
        return ResponseEntity.ok(response);
    }
}