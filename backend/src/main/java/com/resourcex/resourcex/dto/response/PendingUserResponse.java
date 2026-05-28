package com.resourcex.resourcex.dto.response;

import com.resourcex.resourcex.entity.PendingUserStatus;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingUserResponse {
    private Long id;
    private String studentId;
    private String name;
    private String email;
    private String phone;
    private String university;
    private String department;
    private Long idCardFileId;
    private PendingUserStatus status;
    private LocalDateTime createdAt;
}
