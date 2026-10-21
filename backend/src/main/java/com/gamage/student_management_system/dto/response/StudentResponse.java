package com.gamage.student_management_system.dto.response;

public record StudentResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        String nic,
        Integer age,
        String phone,
        CourseResponse course

) {
}
