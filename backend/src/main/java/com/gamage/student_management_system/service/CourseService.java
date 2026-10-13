package com.gamage.student_management_system.service;

import com.gamage.student_management_system.entity.Course;
import com.gamage.student_management_system.repository.CourseRepository;
import com.gamage.student_management_system.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;

    public List<Course> getAll() {
        return courseRepository.findAll();
    }

    public Course getById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
    }

    public Course create(Course course) {
        course.setId(null);
        return courseRepository.save(course);
    }

    public Course update(Long id, Course updated) {
        Course existing = getById(id);
        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setCredits(updated.getCredits());
        return courseRepository.save(existing);
    }

    public void delete(Long id) {
        getById(id);
        if (studentRepository.existsByCourseId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot delete a course that has students");
        }
        courseRepository.deleteById(id);
    }
}