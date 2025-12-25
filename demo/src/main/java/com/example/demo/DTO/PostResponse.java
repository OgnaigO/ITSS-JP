package com.example.demo.DTO;

import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostResponse {

    private String id;
    private String title;
    private String description;

    @Builder.Default
    private List<String> slideUrls = new ArrayList<>();
    private String thumbnailUrl;

    private String category;

    private LocalDateTime createdAt;

    // đồng bộ tên theo bạn muốn
    private String authorUserName;
    
    // Avatar URL của tác giả
    private String authorAvatarUrl;

    @Builder.Default
    private List<CommentResponse> comments = new ArrayList<>();
}
