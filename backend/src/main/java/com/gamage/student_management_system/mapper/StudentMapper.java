package com.gamage.student_management_system.mapper;

import com.gamage.student_management_system.dto.request.StudentRequest;
import com.gamage.student_management_system.dto.response.StudentResponse;
import com.gamage.student_management_system.entity.Student;

public final class StudentMapper {

    private StudentMapper() {
    }

    public static StudentResponse toResponse(Student student) {
        return new StudentResponse(
                student.getId(),
                student.getFirstName(),
                student.getLastName(),
                student.getEmail(),
                student.getAge(),
                student.getPhone(),
                student.getNic(),
                student.getCourse() == null ? null : CourseMapper.toResponse(student.getCourse())

        );
    }

    public static Student toEntity(StudentRequest request) {
        Student student = new Student();
        updateEntity(student, request);
        return student;
    }


    public static void updateEntity(Student student, StudentRequest request) {
        student.setFirstName(request.firstName());
        student.setLastName(request.lastName());
        student.setEmail(request.email());
        student.setAge(request.age());
        student.setPhone(request.phone());
        student.setNic(request.nic());
    }
}