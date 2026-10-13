package com.gamage.student_management_system.controller;

import com.gamage.student_management_system.entity.Course;
import com.gamage.student_management_system.entity.Student;
import com.gamage.student_management_system.service.CourseService;
import com.gamage.student_management_system.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final StudentService studentService;

    @GetMapping
    public List<Course> getAll() {
        return courseService.getAll();
    }

    @GetMapping("/{id}")
    public Course getById(@PathVariable Long id) {
        return courseService.getById(id);
    }

    @GetMapping("/{id}/students")
    public List<Student> getStudents(@PathVariable Long id) {
        courseService.getById(id);
        return studentService.getByCourse(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Course create(@RequestBody Course course) {
        return courseService.create(course);
    }

    @PutMapping("/{id}")
    public Course update(@PathVariable Long id, @RequestBody Course course) {
        return courseService.update(id, course);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        courseService.delete(id);
    }
}
