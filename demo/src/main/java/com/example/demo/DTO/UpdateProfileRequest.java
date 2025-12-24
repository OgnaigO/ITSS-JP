package com.example.demo.DTO;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String username;
    private String school;
    private String role;
    private String bio;
    private String phone;
    private String address;
}
