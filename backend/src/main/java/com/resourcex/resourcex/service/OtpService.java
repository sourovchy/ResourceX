package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.request.OtpRequest;
import com.resourcex.resourcex.dto.request.OtpVerifyRequest;
import com.resourcex.resourcex.dto.response.OtpResponse;

public interface OtpService {

    OtpResponse sendOtp(OtpRequest request);

    OtpResponse verifyOtp(OtpVerifyRequest request);

    OtpResponse resendOtp(OtpRequest request);
}