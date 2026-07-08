package com.resourcex.resourcex.entity;

import java.io.Serializable;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserBlockId implements Serializable {
    private Long blocker;
    private Long blocked;
}
