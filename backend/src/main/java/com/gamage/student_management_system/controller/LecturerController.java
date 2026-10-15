package com.gamage.student_management_system.controller;

import com.gamage.student_management_system.dto.response.CourseResponse;
import com.gamage.student_management_system.dto.response.StudentResponse;
import com.gamage.student_management_system.service.LecturerService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/lecturer")
@RequiredArgsConstructor
public class LecturerController {

    private final LecturerService lecturerService;

    @GetMapping("/courses")
    public List<CourseResponse> myCourses(Authentication authentication) {
        return lecturerService.getMyCourses(authentication.getName());
    }

    @GetMapping("/courses/{courseId}/students")
    public List<StudentResponse> myCourseStudents(@PathVariable Long courseId,
                                                  Authentication authentication) {
        return lecturerService.getMyCourseStudents(authentication.getName(), courseId);
    }
}