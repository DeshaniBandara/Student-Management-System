package com.gamage.student_management_system.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor

public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    private Integer credits;
    @ManyToOne
    @JoinColumn(name = "lecturer_id")
    private User lecturer;

    @OneToMany(mappedBy = "course")
    private List<Student> students = new ArrayList<>();
}