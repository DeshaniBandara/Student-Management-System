package com.gamage.student_management_system.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    private Integer age;

    private String phone;
    @Column(nullable = false, unique = true)
    private String nic;// to assign NIC as the unique value need to add it


    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;
}
