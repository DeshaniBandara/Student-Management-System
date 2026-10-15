package com.gamage.student_management_system.mapper;

import com.gamage.student_management_system.dto.response.UserResponse;
import com.gamage.student_management_system.entity.User;

public final class UserMapper {

    private UserMapper() {
    }

    public static UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}
