package com.example.demo.controller;

import com.example.demo.model.Comment;
import com.example.demo.model.Post;
import com.example.demo.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin("*")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping("/filter")
    public Page<Post> filterPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String category
    ) {
        return postService.filterPosts(page, size, sortBy, direction, title, category);
    }

    @GetMapping("/{id}")
    public Post getOne(@PathVariable String id) {
        return postService.getPostById(id);
    }

    @PutMapping("/{id}")
    public Post updatePost(@PathVariable String id, @RequestBody Post updated) {
        return postService.updatePost(id, updated);
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> deletePost(@PathVariable String id) {
        postService.deletePost(id);

        return Map.of(
                "message", "Post deleted successfully",
                "postId", id
        );
    }

    @PostMapping("/{postId}/comments")
    public Post addComment(
            @PathVariable String postId,
            @RequestBody Comment comment
    ) {
        return postService.addComment(postId, comment);
    }

    @PutMapping("/{postId}/comments/{commentId}")
    public Post updateComment(
            @PathVariable String postId,
            @PathVariable String commentId,
            @RequestBody Comment updated
    ) {
        return postService.updateComment(postId, commentId, updated);
    }

    @DeleteMapping("/{postId}/comments/{commentId}")
    public Post deleteComment(
            @PathVariable String postId,
            @PathVariable String commentId
    ) {
        return postService.deleteComment(postId, commentId);
    }


    @PostMapping(consumes = {"multipart/form-data"})
    public Post createPost(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam String category,
            @RequestParam String authorName,
            @RequestPart("slides") List<MultipartFile> slides
    ) throws IOException {

        return postService.createPostWithFiles(
                title, description, category, authorName, slides
        );
    }

}
