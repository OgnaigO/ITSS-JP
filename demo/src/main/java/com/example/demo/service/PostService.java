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
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;

    /* ======================= GET POSTS ======================= */

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
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        boolean hasTitle = title != null && !title.isEmpty();
        boolean hasCategory = category != null && !category.isEmpty();

        if (hasTitle && hasCategory) {
            return postRepository
                    .findByTitleContainingIgnoreCaseAndCategoryIgnoreCase(title, category, pageable);
        }

        if (hasTitle) {
            return postRepository.findByTitleContainingIgnoreCase(title, pageable);
        }

        if (hasCategory) {
            return postRepository.findByCategoryIgnoreCase(category, pageable);
        }

        return postRepository.findAll(pageable);
    }

    public Post getPostById(String id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
    }

    /* ======================= UPDATE / DELETE ======================= */

    public Post updatePost(String id, Post updatedPost) {
        Post existing = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (updatedPost.getTitle() != null)
            existing.setTitle(updatedPost.getTitle());

        if (updatedPost.getDescription() != null)
            existing.setDescription(updatedPost.getDescription());

        if (updatedPost.getCategory() != null)
            existing.setCategory(updatedPost.getCategory());

        if (updatedPost.getSlideUrls() != null)
            existing.setSlideUrls(updatedPost.getSlideUrls());

        return postRepository.save(existing);
    }

    public void deletePost(String id) {
        if (!postRepository.existsById(id))
            throw new RuntimeException("Post not found");

        postRepository.deleteById(id);
    }

    /* ======================= COMMENTS ======================= */

    public Post addComment(String postId, Comment comment) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        comment.setId(UUID.randomUUID().toString());
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

        post.getComments().removeIf(c -> Objects.equals(c.getId(), commentId));
        post.getComments().removeIf(c -> Objects.equals(c.getParentId(), commentId));

        return postRepository.save(post);
    }

    /* ======================= CREATE POST + FILES ======================= */

    public Post createPostWithFiles(
            String title,
            String description,
            String category,
            String authorName,
            MultipartFile thumbnail,
            List<MultipartFile> slides
    ) throws IOException {

        String uploadDir = "target/uploads/slides/";
        Files.createDirectories(Paths.get(uploadDir));

        /* ===== Thumbnail ===== */
        String thumbSafe = sanitizeFilename(thumbnail.getOriginalFilename());
        String thumbnailName = UUID.randomUUID() + "_" + thumbSafe;

        Path thumbnailPath = Paths.get(uploadDir + thumbnailName);
        Files.copy(thumbnail.getInputStream(), thumbnailPath, StandardCopyOption.REPLACE_EXISTING);

        String thumbnailUrl = "/slides/" + thumbnailName;

        /* ===== Slides ===== */
        List<String> slideUrls = new ArrayList<>();
        for (MultipartFile file : slides) {

            String safeName = sanitizeFilename(file.getOriginalFilename());
            String fileName = UUID.randomUUID() + "_" + safeName;

            Path path = Paths.get(uploadDir + fileName);
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

            slideUrls.add("/slides/" + fileName);
        }

        /* ===== Build Post ===== */
        Post post = new Post();
        post.setTitle(title);
        post.setDescription(description);
        post.setCategory(category);
        post.setThumbnailUrl(thumbnailUrl);
        post.setSlideUrls(slideUrls);
        post.setCreatedAt(LocalDateTime.now());

        User author = new User();
        author.setId(UUID.randomUUID().toString());
        author.setUsername(authorName);
        post.setAuthor(author);

        return postRepository.save(post);
    }

    /* ======================= UTIL ======================= */

    private String sanitizeFilename(String original) {
        return original
                .trim()
                .replaceAll("\\s+", "_")
                .replaceAll("[^a-zA-Z0-9._-]", "");
    }
}
