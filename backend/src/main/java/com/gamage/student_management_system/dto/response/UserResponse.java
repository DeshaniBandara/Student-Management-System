package com.gamage.student_management_system.dto.response;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        String role
) {
}
