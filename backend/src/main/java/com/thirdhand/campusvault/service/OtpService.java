package com.thirdhand.campusvault.service;

import com.thirdhand.campusvault.dto.request.OtpRequest;
import com.thirdhand.campusvault.dto.request.OtpVerifyRequest;

public interface OtpService {
    void requestOtp(OtpRequest request);
    void verifyOtp(OtpVerifyRequest request);
}