package com.example.demo.DTO;

import lombok.Data;

@Data
public class ExplainPostRequest {
    private String postId;
    private String level; // beginner | intermediate | advanced
}
