package com.gamage.student_management_system.repository;

import com.gamage.student_management_system.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {
}
