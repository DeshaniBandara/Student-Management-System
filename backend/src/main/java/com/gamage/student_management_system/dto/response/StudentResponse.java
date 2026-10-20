package com.gamage.student_management_system.dto.response;

public record StudentResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        Integer age,
        String phone,
        String nic,
        CourseResponse course

) {
}
