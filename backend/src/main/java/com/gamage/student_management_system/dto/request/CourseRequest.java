package com.gamage.student_management_system.dto.request;
import jakarta.validation.constraints.Pattern;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record CourseRequest(
        @NotBlank(message = "Course code is required")
        @Pattern(regexp = "^[A-Z0-9]{3,10}$", message = "Course code must be 3-10 uppercase letters or numbers (e.g., ICT101)")
        String courseCode,


        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must be at most 255 characters")
        String title,


        @Size(max = 1000, message = "Description must be at most 1000 characters")
        String description,

        @NotNull(message = "Credits are required")
        @Min(value = 1, message = "Credits must be at least 1")//Credit limit
        @Max(value = 140, message = "Credits cannot exceed 140")
        @Positive(message = "Credits must be a positive number")
        Integer credits,

        @NotNull(message = "Lecturer is required")
        Long lecturerId
) {
}
