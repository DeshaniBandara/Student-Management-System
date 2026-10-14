package com.gamage.student_management_system.dto.response;

public record CourseResponse(
        Long id,
        String title,
        String description,
        Integer credits
) {
}