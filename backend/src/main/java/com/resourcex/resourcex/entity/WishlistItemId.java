package com.resourcex.resourcex.entity;

import java.io.Serializable;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WishlistItemId implements Serializable {
    private Long user;
    private Long item;
}
