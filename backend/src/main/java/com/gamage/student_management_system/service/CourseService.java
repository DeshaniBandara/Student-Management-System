package com.gamage.student_management_system.service;

import com.gamage.student_management_system.dto.request.CourseRequest;
import com.gamage.student_management_system.dto.response.CourseResponse;
import com.gamage.student_management_system.entity.Course;
import com.gamage.student_management_system.entity.Role;
import com.gamage.student_management_system.entity.Student;
import com.gamage.student_management_system.entity.User;
import com.gamage.student_management_system.exception.BadRequestException;
import com.gamage.student_management_system.exception.ResourceNotFoundException;
import com.gamage.student_management_system.mapper.CourseMapper;
import com.gamage.student_management_system.repository.CourseRepository;
import com.gamage.student_management_system.repository.StudentRepository;
import com.gamage.student_management_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CourseResponse> getAll() {
        return courseRepository.findAll().stream()
                .map(CourseMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CourseResponse getById(Long id) {
        return CourseMapper.toResponse(findCourse(id));
    }

    @Transactional
    public CourseResponse create(CourseRequest request) {
        Course course = CourseMapper.toEntity(request);
        course.setLecturer(resolveLecturer(request.lecturerId()));
        return CourseMapper.toResponse(courseRepository.save(course));
    }

    @Transactional
    public CourseResponse update(Long id, CourseRequest request) {
        Course course = findCourse(id);
        CourseMapper.updateEntity(course, request);
        course.setLecturer(resolveLecturer(request.lecturerId()));
        return CourseMapper.toResponse(courseRepository.save(course));
    }

    // Deleting a course leaves its students without a course (they can be reassigned)
    @Transactional
    public void delete(Long id) {
        Course course = findCourse(id);

        List<Student> enrolled = studentRepository.findByCourseId(id);
        enrolled.forEach(student -> student.setCourse(null));
        studentRepository.saveAll(enrolled);

        courseRepository.delete(course);
    }

    private Course findCourse(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id " + id));
    }

    private User resolveLecturer(Long lecturerId) {
        if (lecturerId == null) {
            return null;
        }
        User user = userRepository.findById(lecturerId)
                .orElseThrow(() -> new ResourceNotFoundException("Lecturer not found with id " + lecturerId));
        if (user.getRole() != Role.LECTURER) {
            throw new BadRequestException("The selected user is not a lecturer");
        }
        return user;
    }
}