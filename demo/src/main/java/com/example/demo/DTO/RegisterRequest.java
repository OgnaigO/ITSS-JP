package com.example.demo.DTO;

import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String username;
    private String password;
    private String role;
    private String school;
}
