package com.example.demo.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "posts")
public class Post {

    @Id
    private String id;

    private String title;
    private String description;

    private List<String> slideUrls = new ArrayList<>();

    private User author;

    private String category;

    private LocalDateTime createdAt;

    private List<Comment> comments = new ArrayList<>();
}
