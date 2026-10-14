package com.gamage.student_management_system.controller;

import com.gamage.student_management_system.dto.request.StudentRequest;
import com.gamage.student_management_system.dto.response.StudentResponse;
import com.gamage.student_management_system.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    public List<StudentResponse> getAll() {
        return studentService.getAll();
    }

    @GetMapping("/{id}")
    public StudentResponse getById(@PathVariable Long id) {
        return studentService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StudentResponse create(@Valid @RequestBody StudentRequest request) {
        return studentService.create(request);
    }

    @PutMapping("/{id}")
    public StudentResponse update(@PathVariable Long id, @Valid @RequestBody StudentRequest request) {
        return studentService.update(id, request);
    }

    @PutMapping("/{studentId}/course/{courseId}")
    public StudentResponse assignCourse(@PathVariable Long studentId, @PathVariable Long courseId) {
        return studentService.assignCourse(studentId, courseId);
    }

    @DeleteMapping("/{studentId}/course")
    public StudentResponse removeCourse(@PathVariable Long studentId) {
        return studentService.removeCourse(studentId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        studentService.delete(id);
    }
}