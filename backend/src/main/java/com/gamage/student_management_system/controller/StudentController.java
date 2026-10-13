package com.gamage.student_management_system.controller;

import com.gamage.student_management_system.entity.Student;
import com.gamage.student_management_system.service.StudentService;
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
    public List<Student> getAll() {
        return studentService.getAll();
    }

    @GetMapping("/{id}")
    public Student getById(@PathVariable Long id) {
        return studentService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Student create(@RequestBody Student student) {
        return studentService.create(student);
    }

    @PutMapping("/{id}")
    public Student update(@PathVariable Long id, @RequestBody Student student) {
        return studentService.update(id, student);
    }

    @PutMapping("/{studentId}/course/{courseId}")
    public Student assignCourse(@PathVariable Long studentId, @PathVariable Long courseId) {
        return studentService.assignCourse(studentId, courseId);
    }

    @DeleteMapping("/{studentId}/course")
    public Student removeCourse(@PathVariable Long studentId) {
        return studentService.removeCourse(studentId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        studentService.delete(id);
    }
}
