package com.example.demo.controller;

import com.example.demo.DTO.ExplainPostResponse;
import com.example.demo.service.GeminiExplainService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiExplainController {

    private final GeminiExplainService service;

    @PostMapping("/posts/{postId}/explain")
    public ExplainPostResponse explainPost(
            @PathVariable String postId,
            @RequestParam(required = false) String level
    ) {
        return service.explainPost(postId, level);
    }
}
