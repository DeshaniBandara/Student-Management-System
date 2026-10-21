package com.gamage.student_management_system.repository;

import com.gamage.student_management_system.entity.Role;
import com.gamage.student_management_system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);

    boolean existsByNic(String nic);//to check email and nic unique or not
    boolean existsByEmailAndIdNot(String email, Long id);
    boolean existsByNicAndIdNot(String nic, Long id);
}
