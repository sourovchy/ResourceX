package com.thirdhand.campusvault.dto.response;

import com.thirdhand.campusvault.entity.UserStatus;
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
    private String idCardDataUrl;
    private UserStatus status;
    private boolean emailVerified;
    private boolean phoneVerified;
    private LocalDateTime createdAt;
}
