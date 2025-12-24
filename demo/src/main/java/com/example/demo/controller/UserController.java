package com.example.demo.controller;

import com.example.demo.DTO.UpdateProfileRequest;
import com.example.demo.DTO.UserProfileResponse;
import com.example.demo.model.User;
import com.example.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 🔹 Upload avatar (1 file)
    @PostMapping("/{id}/avatar")
    public User uploadAvatar(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file
    ) {
        return userService.uploadAvatar(id, file);
    }

    // 🔹 Update profile
    @PutMapping("/{id}")
    public User updateProfile(
            @PathVariable String id,
            @RequestBody UpdateProfileRequest request
    ) {
        return userService.updateProfile(id, request);
    }

    // 🔹 Get all users
    @GetMapping
    public List<UserProfileResponse> getAllUsers() {
        return userService.getAllUserProfiles();
    }

    // 🔹 Get user by id
    @GetMapping("/{id}")
    public UserProfileResponse getUserById(@PathVariable String id) {
        return userService.getUserProfileById(id);
    }

}
