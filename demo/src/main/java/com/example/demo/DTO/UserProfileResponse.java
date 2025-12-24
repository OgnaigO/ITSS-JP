package com.example.demo.DTO;

import lombok.Data;

@Data
public class UserProfileResponse {
    private String id;
    private String email;
    private String username;
    private String role;
    private String school;
    private String avatarUrl;
    private String bio;
    private String address;
    private String phone;
}
