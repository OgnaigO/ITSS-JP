package com.example.demo.service;

import com.example.demo.DTO.UpdateProfileRequest;
import com.example.demo.DTO.UserProfileResponse;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /* ===================== UPLOAD AVATAR ===================== */

    public User uploadAvatar(String userId, MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File rỗng");
        }

        if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
            throw new RuntimeException("Chỉ cho phép upload ảnh");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        try {
            Path uploadDir = Paths.get("uploads/avatars");
            Files.createDirectories(uploadDir);

            String originalName = file.getOriginalFilename();
            String ext = "";

            if (originalName != null && originalName.contains(".")) {
                ext = originalName.substring(originalName.lastIndexOf("."));
            }

            String filename = user.getId() + "_" + UUID.randomUUID() + ext;

            Path filePath = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            user.setAvatarUrl("uploads/avatars/" + filename);

            return userRepository.save(user);

        } catch (Exception e) {
            throw new RuntimeException("Upload avatar thất bại", e);
        }
    }

    /* ===================== UPDATE PROFILE ===================== */

    public User updateProfile(String userId, UpdateProfileRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            user.setUsername(request.getUsername());
        }

        if (request.getSchool() != null && !request.getSchool().isBlank()) {
            user.setSchool(request.getSchool());
        }

        if (request.getRole() != null && !request.getRole().isBlank()) {
            user.setRole(request.getRole());
        }

        if (request.getBio() != null && !request.getBio().isBlank()) {
            user.setBio(request.getBio());
        }

        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            user.setPhone(request.getPhone());
        }

        if (request.getAddress() != null && !request.getAddress().isBlank()) {
            user.setAddress(request.getAddress());
        }

        return userRepository.save(user);
    }


    /* ===================== GET ALL USERS ===================== */

    public List<UserProfileResponse> getAllUserProfiles() {
        return userRepository.findAll().stream().map(user -> {
            UserProfileResponse res = new UserProfileResponse();
            res.setId(user.getId());
            res.setEmail(user.getEmail());
            res.setUsername(user.getUsername());
            res.setRole(user.getRole());
            res.setSchool(user.getSchool());
            res.setAvatarUrl(user.getAvatarUrl());
            res.setBio(user.getBio());
            res.setPhone(user.getPhone());
            res.setAddress(user.getAddress());
            return res;
        }).toList();
    }

    public UserProfileResponse getUserProfileById(String userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        UserProfileResponse res = new UserProfileResponse();
        res.setId(user.getId());
        res.setEmail(user.getEmail());
        res.setUsername(user.getUsername());
        res.setRole(user.getRole());
        res.setSchool(user.getSchool());
        res.setAvatarUrl(user.getAvatarUrl());
        res.setBio(user.getBio());
        res.setPhone(user.getPhone());
        res.setAddress(user.getAddress());
        return res;
    }

}
