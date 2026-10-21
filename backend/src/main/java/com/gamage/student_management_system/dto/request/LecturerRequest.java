package com.gamage.student_management_system.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record LecturerRequest(

        @NotBlank(message = "Full name is required")
        @Size(max = 255, message = "Full name must be at most 255 characters")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        @Size(max = 255, message = "Email must be at most 255 characters")
        String email,

        @NotBlank(message = "NIC is required")
        @Pattern(regexp = "^([0-9]{9}[vVxX]|[0-9]{12})$", message = "Invalid NIC format (e.g., 123456789V or 200012345678)")
        String nic,

        // Can not put @NotBlank because when update password, password can not be changed.
        @Size(min = 8, message = "Password must be at least 8 characters")
        String password,

        String confirmPassword
) {
    // To check both passwords are same or not  (Backend Validation)
    @AssertTrue(message = "Passwords do not match")
    public boolean isPasswordConfirmed() {
        if (password == null || password.isBlank()) {
            return true; // When update , if there is no password, it should be sent
        }
        return password.equals(confirmPassword);
    }
}
