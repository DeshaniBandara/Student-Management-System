package com.gamage.student_management_system.controller;

import com.gamage.student_management_system.dto.request.RegisterRequest;
import com.gamage.student_management_system.dto.response.UserResponse;
import com.gamage.student_management_system.service.LecturerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/lecturers")
@RequiredArgsConstructor
public class AdminLecturerController {

    private final LecturerService lecturerService;

    @GetMapping
    public List<UserResponse> getAll() {
        return lecturerService.getAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse create(@Valid @RequestBody RegisterRequest request) {
        return lecturerService.create(request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        lecturerService.delete(id);
    }
}