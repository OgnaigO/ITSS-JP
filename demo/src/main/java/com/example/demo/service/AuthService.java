package com.example.demo.service;

import com.example.demo.DTO.LoginRequest;
import com.example.demo.DTO.RegisterRequest;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    public User register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }

        if (userRepository.existsByUsername(req.getUsername())) {
            throw new RuntimeException("Username đã tồn tại");
        }

        User user = User.builder()
                .email(req.getEmail())
                .username(req.getUsername())
                .password(req.getPassword()) // plain text (demo)
                .role(req.getRole())
                .school(req.getSchool())
                .build();

        return userRepository.save(user);
    }

    public User login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Sai email"));

        if (!user.getPassword().equals(req.getPassword())) {
            throw new RuntimeException("Sai password");
        }

        return user;
    }
}
