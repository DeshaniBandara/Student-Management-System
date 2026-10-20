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

    // The logged-in student's own record, linked to the account by email
    @Transactional(readOnly = true)
    public StudentResponse getByEmail(String email) {
        return studentRepository.findByEmailIgnoreCase(email)
                .map(StudentMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No student record is linked to your account yet. Please contact the administrator."));
    }

    @Transactional
    public StudentResponse create(StudentRequest request) {
        if (studentRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already exists");
        }
        //To check whether NIC is available or not
        if (studentRepository.existsByNic(request.nic())) {
            throw new ConflictException("A student with this NIC already exists");
        }
        //To check whether telephone no  is available or not
        if (studentRepository.existsByPhone(request.phone())) {
            throw new ConflictException("Phone number already exists");
        }
        Student student = StudentMapper.toEntity(request);
        student.setCourse(resolveCourse(request.courseId()));
        return StudentMapper.toResponse(studentRepository.save(student));
    }

    @Transactional
    public StudentResponse update(Long id, StudentRequest request) {
        Student student = findStudent(id);

        // 1. Validation checks FIRST (before mutating the entity)
        if (studentRepository.existsByEmailAndIdNot(request.email(), id)) {
            throw new ConflictException("Email already exists");
        }
        if (studentRepository.existsByPhoneAndIdNot(request.phone(), id)) {
            throw new ConflictException("Phone number already exists");
        }
        if (studentRepository.existsByNicAndIdNot(request.nic(), id)) {
            throw new ConflictException("A student with this NIC already exists");
        }

        // 2. Map the new data to the existing entity
        StudentMapper.updateEntity(student, request);

        // 3. Resolve and set the course (Removed the hardcoded test)
        Course course = resolveCourse(request.courseId());
        student.setCourse(course);

        // 4. Save and return
        Student savedStudent = studentRepository.save(student);
        return StudentMapper.toResponse(savedStudent);
    }

    @Transactional
    public StudentResponse assignCourse(Long studentId, Long courseId) {
        Student student = findStudent(studentId);
        student.setCourse(resolveCourse(courseId));
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

    private Course resolveCourse(Long courseId) {
        if (courseId == null) {
            return null;
        }
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id " + courseId));
    }

}