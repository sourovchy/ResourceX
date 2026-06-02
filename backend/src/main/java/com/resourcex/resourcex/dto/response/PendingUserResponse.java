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
    // Resolved stored file name for the uploaded ID card (served via GET /api/files/{name}).
    // Null when no ID card is on file.
    private String idCardDataUrl;
    private PendingUserStatus status;
    private LocalDateTime createdAt;
}
