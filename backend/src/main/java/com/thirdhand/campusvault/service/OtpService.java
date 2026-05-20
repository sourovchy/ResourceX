package com.thirdhand.campusvault.service;

import com.thirdhand.campusvault.dto.request.OtpRequest;
import com.thirdhand.campusvault.dto.request.OtpVerifyRequest;
import com.thirdhand.campusvault.dto.response.OtpResponse;

public interface OtpService {

    OtpResponse sendOtp(OtpRequest request);

    OtpResponse verifyOtp(OtpVerifyRequest request);

    OtpResponse resendOtp(OtpRequest request);
}