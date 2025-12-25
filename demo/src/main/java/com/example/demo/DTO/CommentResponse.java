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
public class CommentResponse {

    private String id;

    private String authorUsername;

    private String content;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private boolean isEdited;

    // parentId để FE biết comment nào là reply của ai
    private String parentId;

    // replies để hiển thị dạng thread
    @Builder.Default
    private List<CommentResponse> replies = new ArrayList<>();
}
