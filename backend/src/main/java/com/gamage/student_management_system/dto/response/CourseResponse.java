package com.gamage.student_management_system.dto.response;

public record CourseResponse(
        Long id,
        String courseCode,//new
        String title,
        String description,
        Integer credits,
        UserResponse lecturer,
        int studentCount
) {
}