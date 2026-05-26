package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.request.OtpRequest;
import com.resourcex.resourcex.dto.request.OtpVerifyRequest;
import com.resourcex.resourcex.dto.response.OtpResponse;
import com.resourcex.resourcex.entity.TokenPurpose;

public interface OtpService {

    OtpResponse sendOtp(OtpRequest request, TokenPurpose purpose);

    OtpResponse verifyOtp(OtpVerifyRequest request, TokenPurpose purpose);

    OtpResponse resendOtp(OtpRequest request, TokenPurpose purpose);
}