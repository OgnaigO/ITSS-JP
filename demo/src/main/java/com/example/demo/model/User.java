package com.example.demo.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    private String id;

    private String email;

    private String username;

    private String password;   // đăng nhập chay: so sánh string

    private String role;       // "TEACHER", "STUDENT"

    private String school;
}
