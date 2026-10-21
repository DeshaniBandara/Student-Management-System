package com.gamage.student_management_system.service;

import com.gamage.student_management_system.dto.request.ChangePasswordRequest;
import com.gamage.student_management_system.dto.request.LoginRequest;
import com.gamage.student_management_system.dto.request.RegisterRequest;
import com.gamage.student_management_system.dto.response.AuthResponse;
import com.gamage.student_management_system.dto.response.UserResponse;
import com.gamage.student_management_system.entity.Role;
import com.gamage.student_management_system.entity.Student;
import com.gamage.student_management_system.entity.User;
import com.gamage.student_management_system.exception.BadRequestException;
import com.gamage.student_management_system.exception.ConflictException;
import com.gamage.student_management_system.exception.ResourceNotFoundException;
import com.gamage.student_management_system.mapper.UserMapper;
import com.gamage.student_management_system.repository.StudentRepository;
import com.gamage.student_management_system.repository.UserRepository;
import com.gamage.student_management_system.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository; //To find the Student
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    //New Register Method
    @Transactional
    public UserResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();

        // 1. To check whether is there any user from this email already
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email is already registered");
        }

        // 2.To check whether Admin already added the student to the system
        Student student = studentRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadRequestException(
                        "Your email is not registered in the system. Please contact the Administrator to add you as a student."
                ));

        // 3. check whether NIC is matched or not
        if (!student.getNic().equalsIgnoreCase(request.nic().trim())) {
            throw new BadRequestException("The provided NIC does not match our records for this email.");
        }

        // 4. If everything is okay create new user
        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.STUDENT);

        return UserMapper.toResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();

        // throws BadCredentialsException if the email or password is wrong
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password()));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, "Bearer", jwtService.getExpirationSeconds(),
                UserMapper.toResponse(user));
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserMapper.toResponse(user);
    }
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 1. To check whther old password is correct or not
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        // 2. To save new password after encode (The database is changed)
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

}