package com.gamage.student_management_system.service;

import com.gamage.student_management_system.dto.request.CourseRequest;
import com.gamage.student_management_system.dto.response.CourseResponse;
import com.gamage.student_management_system.entity.Course;
import com.gamage.student_management_system.exception.ConflictException;
import com.gamage.student_management_system.exception.ResourceNotFoundException;
import com.gamage.student_management_system.mapper.CourseMapper;
import com.gamage.student_management_system.repository.CourseRepository;
import com.gamage.student_management_system.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;

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
        Course saved = courseRepository.save(CourseMapper.toEntity(request));
        return CourseMapper.toResponse(saved);
    }

    @Transactional
    public CourseResponse update(Long id, CourseRequest request) {
        Course course = findCourse(id);
        CourseMapper.updateEntity(course, request);
        return CourseMapper.toResponse(courseRepository.save(course));
    }

    @Transactional
    public void delete(Long id) {
        Course course = findCourse(id);
        if (studentRepository.existsByCourseId(id)) {
            throw new ConflictException("Cannot delete a course that has students");
        }
        courseRepository.delete(course);
    }

    private Course findCourse(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id " + id));
    }
}