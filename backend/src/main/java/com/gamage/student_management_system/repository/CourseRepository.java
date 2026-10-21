package com.gamage.student_management_system.repository;

import com.gamage.student_management_system.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByLecturerId(Long lecturerId);
    boolean existsByLecturerId(Long lecturerId);

    boolean existsByCourseCode(String courseCode); // for Create
    boolean existsByCourseCodeAndIdNot(String courseCode, Long id); // for Update
}
