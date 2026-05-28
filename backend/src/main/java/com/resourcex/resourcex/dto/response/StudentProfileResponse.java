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
    private Integer trustScore;
    private Boolean emailVerified;
    private Boolean phoneVerified;
}
