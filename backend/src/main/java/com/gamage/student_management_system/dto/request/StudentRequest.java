package com.gamage.student_management_system.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record StudentRequest(

        @NotBlank(message = "First name is required")//To assign like can not keep blank
        @Size(max = 255, message = "First name must be at most 255 characters")//To set max size and if size is too much this message should be shown
        @Pattern(regexp = "^[a-zA-Z\\s]+$", message = "First name must contain only letters and spaces")// To set the pattern to avoid using numbers in the firstaname only the letters can be used.
        String firstName,

        @NotBlank(message = "Last name is required")
        @Size(max = 255, message = "Last name must be at most 255 characters")
        @Pattern(regexp = "^[a-zA-Z\\s]+$", message = "Last name must contain only letters and spaces")
        String lastName,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")//With this annotation the email will be in the correct format
        @Size(max = 255, message = "Email must be at most 255 characters")//Set the max size of the email
        String email,

        @NotBlank(message = "Age is required")//Avoid to keep blank
        @Min(value = 18, message = "Age must be at least 18")
        @Max(value = 50, message = "Age must be at most 50")
        Integer age,

        @NotBlank(message = "Phone number is required")//Avoid to keep blank
        @Pattern(regexp = "^(?:\\+94|0)[0-9]{9}$", message = "Phone number must be 10 or 11 digits and can be started with +94 or 0")//To keep valid entering valid phone numbers
        String phone,

        @NotBlank(message = "Course ID is required")//Course can not be empty , Must add a course now
        Long courseId
) {
}