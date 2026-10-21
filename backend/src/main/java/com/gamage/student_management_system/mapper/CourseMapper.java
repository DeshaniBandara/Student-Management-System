package com.gamage.student_management_system.mapper;

import com.gamage.student_management_system.dto.request.CourseRequest;
import com.gamage.student_management_system.dto.response.CourseResponse;
import com.gamage.student_management_system.entity.Course;

public final class CourseMapper {

    private CourseMapper() {
    }

    public static CourseResponse toResponse(Course course) {
        return new CourseResponse(
                course.getId(),
                course.getCourseCode(),//new
                course.getTitle(),
                course.getDescription(),
                course.getCredits(),
                course.getLecturer() == null ? null : UserMapper.toResponse(course.getLecturer()),
                course.getStudents().size()
        );
    }

    public static Course toEntity(CourseRequest request) {
        Course course = new Course();
        updateEntity(course, request);
        return course;
    }

    public static void updateEntity(Course course, CourseRequest request) {
        course.setCourseCode(request.courseCode().toUpperCase());//new
        course.setTitle(request.title());
        course.setDescription(request.description());
        course.setCredits(request.credits());
    }
}