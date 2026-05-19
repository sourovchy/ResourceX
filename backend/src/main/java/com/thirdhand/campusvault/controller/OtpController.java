package com.thirdhand.campusvault.controller;

import com.thirdhand.campusvault.dto.request.OtpRequest;
import com.thirdhand.campusvault.dto.request.OtpVerifyRequest;
import com.thirdhand.campusvault.dto.response.OtpResponse;
import com.thirdhand.campusvault.service.OtpService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/otp")
public class OtpController {

    private final OtpService otpService;

    public OtpController(OtpService otpService) {
        this.otpService = otpService;
    }

    @PostMapping("/request")
    public ResponseEntity<OtpResponse> requestOtp(
            @Valid @RequestBody OtpRequest request
    ) {

        try {

            otpService.requestOtp(request);

            return ResponseEntity.ok(
                    new OtpResponse(
                            true,
                            "OTP sent successfully",
                            Instant.now()
                    )
            );

        } catch (IllegalStateException e) {

            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(
                            new OtpResponse(
                                    false,
                                    e.getMessage(),
                                    Instant.now()
                            )
                    );

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(
                            new OtpResponse(
                                    false,
                                    e.getMessage(),
                                    Instant.now()
                            )
                    );

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new OtpResponse(
                                    false,
                                    "Something went wrong",
                                    Instant.now()
                            )
                    );
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<OtpResponse> verifyOtp(
            @Valid @RequestBody OtpVerifyRequest request
    ) {

        try {

            otpService.verifyOtp(request);

            return ResponseEntity.ok(
                    new OtpResponse(
                            true,
                            "OTP verified successfully",
                            Instant.now()
                    )
            );

        } catch (IllegalStateException e) {

            return ResponseEntity.badRequest()
                    .body(
                            new OtpResponse(
                                    false,
                                    e.getMessage(),
                                    Instant.now()
                            )
                    );

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(
                            new OtpResponse(
                                    false,
                                    e.getMessage(),
                                    Instant.now()
                            )
                    );

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new OtpResponse(
                                    false,
                                    "Something went wrong",
                                    Instant.now()
                            )
                    );
        }
    }
}