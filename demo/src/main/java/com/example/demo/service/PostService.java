package com.example.demo.service;

import com.example.demo.model.Comment;
import com.example.demo.model.Post;
import com.example.demo.model.User;
import com.example.demo.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;

    public Page<Post> getPosts(int page, int size, String sortBy, String direction) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return postRepository.findAll(pageable);
    }

    public Page<Post> filterPosts(
            int page,
            int size,
            String sortBy,
            String direction,
            String title,
            String category
    ) {

        // Sort
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        boolean hasTitle = title != null && !title.isEmpty();
        boolean hasCategory = category != null && !category.isEmpty();

        // 1) Search title + category
        if (hasTitle && hasCategory) {
            return postRepository.findByTitleContainingIgnoreCaseAndCategoryIgnoreCase(
                    title, category, pageable
            );
        }

        // 2) Only search title
        if (hasTitle) {
            return postRepository.findByTitleContainingIgnoreCase(title, pageable);
        }

        // 3) Only filter category
        if (hasCategory) {
            return postRepository.findByCategoryIgnoreCase(category, pageable);
        }

        // 4) No filter -> normal query
        return postRepository.findAll(pageable);
    }

    public Post getPostById(String id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
    }

    public Post updatePost(String id, Post updatedPost) {

        Post existing = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (updatedPost.getTitle() != null)
            existing.setTitle(updatedPost.getTitle());

        if (updatedPost.getDescription() != null)
            existing.setDescription(updatedPost.getDescription());

        if (updatedPost.getCategory() != null)
            existing.setCategory(updatedPost.getCategory());

        // 🔥 FULL REPLACE slideUrls nếu FE gửi list mới
        if (updatedPost.getSlideUrls() != null) {
            existing.setSlideUrls(updatedPost.getSlideUrls());
        }

        return postRepository.save(existing);
    }



    public void deletePost(String id) {
        if (!postRepository.existsById(id))
            throw new RuntimeException("Post not found");

        postRepository.deleteById(id);
    }

    public Post addComment(String postId, Comment comment) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Tạo ID comment
        comment.setId(UUID.randomUUID().toString());

        // Set thời gian
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUpdatedAt(LocalDateTime.now());

        post.getComments().add(comment);

        return postRepository.save(post);
    }


    public Post updateComment(String postId, String commentId, Comment updated) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        for (Comment c : post.getComments()) {
            if (Objects.equals(c.getId(), commentId)) {

                c.setContent(updated.getContent());
                c.setUpdatedAt(LocalDateTime.now());
                c.setEdited(true);

                break;
            }
        }

        return postRepository.save(post);
    }


    public Post deleteComment(String postId, String commentId) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Xoá comment chính (an toàn khi c.getId() = null)
        post.getComments().removeIf(c -> Objects.equals(c.getId(), commentId));

        // Xoá mọi comment con (reply) — an toàn khi parentId = null
        post.getComments().removeIf(c -> Objects.equals(c.getParentId(), commentId));

        return postRepository.save(post);
    }

    public Post createPostWithFiles(
            String title,
            String description,
            String category,
            String authorName,
            List<MultipartFile> slides
    ) throws IOException {

        String uploadDir = "src/main/resources/static/slides/";

        List<String> slideUrls = new ArrayList<>();

        for (MultipartFile file : slides) {

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path path = Paths.get(uploadDir + fileName);

            Files.copy(file.getInputStream(), path);

            slideUrls.add("/slides/" + fileName);
        }

        Post post = new Post();
        post.setTitle(title);
        post.setDescription(description);
        post.setCategory(category);
        post.setSlideUrls(slideUrls);

        User author = new User();
        author.setId(UUID.randomUUID().toString());
        author.setName(authorName);
        post.setAuthor(author);

        post.setCreatedAt(LocalDateTime.now());

        return postRepository.save(post);
    }




}
