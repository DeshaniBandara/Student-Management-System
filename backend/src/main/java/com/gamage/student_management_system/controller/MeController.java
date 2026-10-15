package com.gamage.student_management_system.controller;

import com.gamage.student_management_system.dto.response.StudentResponse;
import com.gamage.student_management_system.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class MeController {

    private final StudentService studentService;

    @GetMapping("/student")
    public StudentResponse myStudentRecord(Authentication authentication) {
        return studentService.getByEmail(authentication.getName());
    }
}