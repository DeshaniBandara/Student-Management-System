package com.gamage.student_management_system.service;

import com.gamage.student_management_system.dto.request.StudentRequest;
import com.gamage.student_management_system.dto.response.StudentResponse;
import com.gamage.student_management_system.entity.Course;
import com.gamage.student_management_system.entity.Student;
import com.gamage.student_management_system.exception.ConflictException;
import com.gamage.student_management_system.exception.ResourceNotFoundException;
import com.gamage.student_management_system.mapper.StudentMapper;
import com.gamage.student_management_system.repository.CourseRepository;
import com.gamage.student_management_system.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

    @Transactional(readOnly = true)
    public List<StudentResponse> getAll() {
        return studentRepository.findAll().stream()
                .map(StudentMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public StudentResponse getById(Long id) {
        return StudentMapper.toResponse(findStudent(id));
    }

    @Transactional(readOnly = true)
    public List<StudentResponse> getByCourse(Long courseId) {
        return studentRepository.findByCourseId(courseId).stream()
                .map(StudentMapper::toResponse)
                .toList();
    }

    @Transactional
    public StudentResponse create(StudentRequest request) {
        if (studentRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already exists");
        }
        Student saved = studentRepository.save(StudentMapper.toEntity(request));
        return StudentMapper.toResponse(saved);
    }

    @Transactional
    public StudentResponse update(Long id, StudentRequest request) {
        Student student = findStudent(id);
        if (studentRepository.existsByEmailAndIdNot(request.email(), id)) {
            throw new ConflictException("Email already exists");
        }
        StudentMapper.updateEntity(student, request);
        return StudentMapper.toResponse(studentRepository.save(student));
    }

    @Transactional
    public StudentResponse assignCourse(Long studentId, Long courseId) {
        Student student = findStudent(studentId);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id " + courseId));
        student.setCourse(course);
        return StudentMapper.toResponse(studentRepository.save(student));
    }

    @Transactional
    public StudentResponse removeCourse(Long studentId) {
        Student student = findStudent(studentId);
        student.setCourse(null);
        return StudentMapper.toResponse(studentRepository.save(student));
    }

    @Transactional
    public void delete(Long id) {
        studentRepository.delete(findStudent(id));
    }

    private Student findStudent(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id " + id));
    }
}