package com.gamage.student_management_system.service;

import com.gamage.student_management_system.entity.Course;
import com.gamage.student_management_system.entity.Student;
import com.gamage.student_management_system.repository.CourseRepository;
import com.gamage.student_management_system.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

    public List<Student> getAll() {
        return studentRepository.findAll();
    }

    public Student getById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
    }

    public List<Student> getByCourse(Long courseId) {
        return studentRepository.findByCourseId(courseId);
    }

    public Student create(Student student) {
        if (studentRepository.existsByEmail(student.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }
        student.setId(null);
        student.setCourse(null);
        return studentRepository.save(student);
    }

    public Student update(Long id, Student updated) {
        Student existing = getById(id);
        existing.setFirstName(updated.getFirstName());
        existing.setLastName(updated.getLastName());
        existing.setEmail(updated.getEmail());
        existing.setAge(updated.getAge());
        existing.setPhone(updated.getPhone());
        return studentRepository.save(existing);
    }

    public Student assignCourse(Long studentId, Long courseId) {
        Student student = getById(studentId);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        student.setCourse(course);
        return studentRepository.save(student);
    }

    public Student removeCourse(Long studentId) {
        Student student = getById(studentId);
        student.setCourse(null);
        return studentRepository.save(student);
    }

    public void delete(Long id) {
        getById(id);
        studentRepository.deleteById(id);
    }
}
