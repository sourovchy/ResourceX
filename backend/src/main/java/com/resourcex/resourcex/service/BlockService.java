package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.response.BlockStatusResponse;
import com.resourcex.resourcex.dto.response.BlockedUserResponse;

import java.util.List;

public interface BlockService {

    BlockStatusResponse blockUser(String currentUserEmail, Long targetUserId);

    BlockStatusResponse unblockUser(String currentUserEmail, Long targetUserId);

    BlockStatusResponse getBlockStatus(String currentUserEmail, Long targetUserId);

    List<BlockedUserResponse> getBlockedUsers(String currentUserEmail);
}
