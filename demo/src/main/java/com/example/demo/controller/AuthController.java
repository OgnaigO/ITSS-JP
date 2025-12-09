package com.example.demo.controller;

import com.example.demo.DTO.LoginRequest;
import com.example.demo.DTO.RegisterRequest;
import com.example.demo.model.User;
import com.example.demo.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public User register(@RequestBody RegisterRequest req) {
        return authService.register(req);
    }

    @PostMapping("/login")
    public User login(@RequestBody LoginRequest req) {
        return authService.login(req);
    }
}