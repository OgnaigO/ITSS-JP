package com.example.demo.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Comment {

    private String id;

    private User author;

    private String content;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private boolean isEdited = false;

    private String parentId;
}
