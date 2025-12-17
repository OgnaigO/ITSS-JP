package com.example.demo.service;

import com.example.demo.DTO.ExplainPostResponse;
import com.example.demo.model.Post;
import com.example.demo.repository.PostRepository;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GeminiExplainService {

    private final PostRepository postRepository;
    private final ExplainPromptBuilder promptBuilder;
    private final ObjectMapper objectMapper;

    private final Client client = new Client(); // đọc GEMINI_API_KEY từ env

    public ExplainPostResponse explainPost(String postId, String level) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        String prompt = promptBuilder.build(post, level);

        GenerateContentResponse response =
                client.models.generateContent(
                        "gemini-2.5-flash",
                        prompt,
                        null
                );

        String text = response.text();

        try {
            return objectMapper.readValue(extractJson(text), ExplainPostResponse.class);
        } catch (Exception e) {
            throw new RuntimeException("Không parse được JSON từ Gemini", e);
        }
    }

    private String extractJson(String text) {
        int start = text.indexOf("{");
        int end = text.lastIndexOf("}");
        if (start == -1 || end == -1) {
            throw new RuntimeException("Gemini không trả JSON hợp lệ");
        }
        return text.substring(start, end + 1);
    }
}
