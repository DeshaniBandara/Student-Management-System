package com.gamage.student_management_system.repository;

import com.gamage.student_management_system.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;



public interface StudentRepository extends JpaRepository<Student, Long> {
    boolean existsByEmail(String email);
    boolean existsByCourseId(Long courseId);
    boolean existsByEmailAndIdNot(String email, Long id);
    List<Student> findByCourseId(Long courseId);
    Optional<Student> findByEmailIgnoreCase(String email);
}