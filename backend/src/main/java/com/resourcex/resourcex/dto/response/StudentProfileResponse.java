package com.resourcex.resourcex.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfileResponse {

    private String studentId;
    private String phone;
    private String university;
    private String department;
    private Long idCardFileId;
    // Resolved stored file name for the uploaded ID card (served via GET /api/files/{name}).
    // Null when no ID card is on file. Populated only for privileged/self viewers.
    private String idCardDataUrl;
    private Integer trustScore;
    private Boolean emailVerified;
    private Boolean phoneVerified;

    private String rejectionReason;
}
