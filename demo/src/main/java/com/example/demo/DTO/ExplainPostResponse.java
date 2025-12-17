package com.example.demo.DTO;

import lombok.Data;

import java.util.List;

@Data
public class ExplainPostResponse {
    private String summary;
    private String explanation;
    private List<String> keyPoints;
    private List<String> suggestedTags;
}
