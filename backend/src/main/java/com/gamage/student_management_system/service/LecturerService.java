package com.gamage.student_management_system.service;

import com.gamage.student_management_system.dto.request.LecturerRequest; // ✅ අලුත් DTO එක
import com.gamage.student_management_system.dto.response.CourseResponse;
import com.gamage.student_management_system.dto.response.StudentResponse;
import com.gamage.student_management_system.dto.response.UserResponse;
import com.gamage.student_management_system.entity.Course;
import com.gamage.student_management_system.entity.Role;
import com.gamage.student_management_system.entity.User;
import com.gamage.student_management_system.exception.ConflictException;
import com.gamage.student_management_system.exception.ResourceNotFoundException;
import com.gamage.student_management_system.mapper.CourseMapper;
import com.gamage.student_management_system.mapper.StudentMapper;
import com.gamage.student_management_system.mapper.UserMapper;
import com.gamage.student_management_system.repository.CourseRepository;
import com.gamage.student_management_system.repository.StudentRepository;
import com.gamage.student_management_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LecturerService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    // ----- Admin: manage lecturers -----

    @Transactional(readOnly = true)
    public List<UserResponse> getAll() {
        return userRepository.findByRole(Role.LECTURER).stream()
                .map(UserMapper::toResponse)
                .toList();
    }

    // ✅ අලුත් Lecturer කෙනෙක් හදන Method එක
    @Transactional
    public UserResponse create(LecturerRequest request) {
        String email = request.email().trim().toLowerCase();

        // 1. Email එක දැනටමත් Database එකේ තියෙනවද බලනවා
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email is already registered");
        }

        // 2. NIC එක දැනටමත් Database එකේ තියෙනවද බලනවා
        if (userRepository.existsByNic(request.nic())) {
            throw new ConflictException("A lecturer with this NIC already exists");
        }

        User lecturer = new User();
        lecturer.setFullName(request.fullName().trim());
        lecturer.setEmail(email);
        lecturer.setNic(request.nic()); // NIC එක Set කිරීම
        lecturer.setPassword(passwordEncoder.encode(request.password())); // Password එක Hash කිරීම
        lecturer.setRole(Role.LECTURER);

        return UserMapper.toResponse(userRepository.save(lecturer));
    }

    // ✅ අලුතින් එකතු කරපු Edit/Update Method එක
    @Transactional
    public UserResponse update(Long id, LecturerRequest request) {
        // 1. මුලින්ම අදාළ ID එකේ Lecturer ව හොයාගන්නවා
        User lecturer = userRepository.findById(id)
                .filter(user -> user.getRole() == Role.LECTURER)
                .orElseThrow(() -> new ResourceNotFoundException("Lecturer not found with id " + id));

        String email = request.email().trim().toLowerCase();

        // 2. වෙනත් කෙනෙකුට මේ Email එක තියෙනවද බලනවා (තමන්ගේ ID එක හැර)
        if (userRepository.existsByEmailAndIdNot(email, id)) {
            throw new ConflictException("Email is already registered");
        }

        // 3. වෙනත් කෙනෙකුට මේ NIC එක තියෙනවද බලනවා (තමන්ගේ ID එක හැර)
        if (userRepository.existsByNicAndIdNot(request.nic(), id)) {
            throw new ConflictException("A lecturer with this NIC already exists");
        }

        // 4. දත්ත ටික Update කරනවා
        lecturer.setFullName(request.fullName().trim());
        lecturer.setEmail(email);
        lecturer.setNic(request.nic());

        // 5. Password එක Update කරන්න ඕන නම් විතරක් (හිස් නම් පරණ එකම තියන්න)
        if (request.password() != null && !request.password().isBlank()) {
            lecturer.setPassword(passwordEncoder.encode(request.password()));
        }

        return UserMapper.toResponse(userRepository.save(lecturer));
    }

    @Transactional
    public void delete(Long id) {
        User lecturer = userRepository.findById(id)
                .filter(user -> user.getRole() == Role.LECTURER)
                .orElseThrow(() -> new ResourceNotFoundException("Lecturer not found with id " + id));

        // Courses taught by this lecturer become "not assigned"
        List<Course> taught = courseRepository.findByLecturerId(id);
        taught.forEach(course -> course.setLecturer(null));
        courseRepository.saveAll(taught);

        userRepository.delete(lecturer);
    }

    // ----- Lecturer: my own courses and class lists -----

    @Transactional(readOnly = true)
    public List<CourseResponse> getMyCourses(String email) {
        User lecturer = findByEmail(email);
        return courseRepository.findByLecturerId(lecturer.getId()).stream()
                .map(CourseMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StudentResponse> getMyCourseStudents(String email, Long courseId) {
        User lecturer = findByEmail(email);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id " + courseId));

        if (course.getLecturer() == null || !course.getLecturer().getId().equals(lecturer.getId())) {
            throw new AccessDeniedException("You are not assigned to this course");
        }
        return studentRepository.findByCourseId(courseId).stream()
                .map(StudentMapper::toResponse)
                .toList();
    }

    private User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}