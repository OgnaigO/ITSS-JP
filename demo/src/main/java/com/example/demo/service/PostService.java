package com.example.demo.service;

import com.example.demo.DTO.CommentResponse;
import com.example.demo.DTO.PostResponse;
import com.example.demo.model.Comment;
import com.example.demo.model.Post;
import com.example.demo.model.User;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.UserRepository;
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
import java.util.*;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    /* ======================= GET POSTS ======================= */

    public Page<PostResponse> filterPosts(
            int page,
            int size,
            String sortBy,
            String direction,
            String title,
            String category,
            String userId
    ) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        boolean hasTitle = title != null && !title.isEmpty();
        boolean hasCategory = category != null && !category.isEmpty();
        boolean hasUserId = userId != null && !userId.isEmpty();

        Page<Post> result;

        if (hasUserId && hasTitle && hasCategory) {
            result = postRepository.findByAuthor_IdAndTitleContainingIgnoreCaseAndCategoryIgnoreCase(
                    userId, title, category, pageable
            );
        } else if (hasUserId && hasTitle) {
            result = postRepository.findByAuthor_IdAndTitleContainingIgnoreCase(
                    userId, title, pageable
            );
        } else if (hasUserId && hasCategory) {
            result = postRepository.findByAuthor_IdAndCategoryIgnoreCase(
                    userId, category, pageable
            );
        } else if (hasUserId) {
            result = postRepository.findByAuthor_Id(userId, pageable);
        } else if (hasTitle && hasCategory) {
            result = postRepository.findByTitleContainingIgnoreCaseAndCategoryIgnoreCase(title, category, pageable);
        } else if (hasTitle) {
            result = postRepository.findByTitleContainingIgnoreCase(title, pageable);
        } else if (hasCategory) {
            result = postRepository.findByCategoryIgnoreCase(category, pageable);
        } else {
            result = postRepository.findAll(pageable);
        }

        return result.map(this::toPostResponse);
    }


    /* ======================= MAPPING DTO ======================= */

    private PostResponse toPostResponse(Post post) {
        User author = post.getAuthor();
        
        // ✅ Luôn fetch author mới nhất từ DB để đảm bảo có username và avatarUrl mới nhất
        User freshAuthor = null;
        if (author != null && author.getId() != null && !author.getId().isBlank()) {
            freshAuthor = userRepository.findById(author.getId()).orElse(null);
        }
        
        // Nếu không tìm thấy theo ID, thử tìm theo username
        if (freshAuthor == null && author != null && author.getUsername() != null && !author.getUsername().isBlank()) {
            freshAuthor = userRepository.findByUsername(author.getUsername()).orElse(null);
        }
        
        // Sử dụng freshAuthor nếu có, nếu không thì dùng author gốc
        User authorToUse = freshAuthor != null ? freshAuthor : author;
        
        String authorUsername = resolveUsername(authorToUse);
        String authorAvatarUrl = authorToUse != null ? authorToUse.getAvatarUrl() : null;
        
        PostResponse dto = PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .description(post.getDescription())
                .slideUrls(post.getSlideUrls() != null ? post.getSlideUrls() : new ArrayList<>())
                .thumbnailUrl(post.getThumbnailUrl())
                .category(post.getCategory())
                .createdAt(post.getCreatedAt())
                .authorUserName(authorUsername)
                .authorAvatarUrl(authorAvatarUrl)
                .comments(buildCommentTree(post.getComments()))
                .build();

        return dto;
    }

    private String resolveUsername(User user) {
        if (user == null) return "Anonymous";
        if (user.getUsername() != null && !user.getUsername().isBlank()) return user.getUsername();

        // nếu chỉ có id thì lấy username từ DB
        if (user.getId() != null && !user.getId().isBlank()) {
            return userRepository.findById(user.getId())
                    .map(u -> u.getUsername() != null ? u.getUsername() : "Anonymous")
                    .orElse("Anonymous");
        }
        return "Anonymous";
    }

    /**
     * Từ list comment phẳng -> list root comments có replies (tree)
     */
    private List<CommentResponse> buildCommentTree(List<Comment> comments) {
        if (comments == null || comments.isEmpty()) return new ArrayList<>();

        Map<String, CommentResponse> map = new HashMap<>();
        List<CommentResponse> roots = new ArrayList<>();

        // 1) tạo node
        for (Comment c : comments) {
            CommentResponse node = CommentResponse.builder()
                    .id(c.getId())
                    .authorUsername(resolveUsername(c.getAuthor()))
                    .content(c.getContent())
                    .createdAt(c.getCreatedAt())
                    .updatedAt(c.getUpdatedAt())
                    .isEdited(c.isEdited())
                    .parentId(c.getParentId())
                    .replies(new ArrayList<>())
                    .build();

            if (c.getId() != null) {
                map.put(c.getId(), node);
            }
        }

        // 2) nối cây
        for (CommentResponse node : map.values()) {
            String parentId = node.getParentId();
            if (parentId == null || parentId.isBlank() || !map.containsKey(parentId)) {
                roots.add(node);
            } else {
                map.get(parentId).getReplies().add(node);
            }
        }

        // (tuỳ chọn) sort replies theo createdAt tăng dần để FE hiển thị đẹp
        sortCommentTreeByCreatedAt(roots);

        return roots;
    }

    private void sortCommentTreeByCreatedAt(List<CommentResponse> nodes) {
        nodes.sort(Comparator.comparing(CommentResponse::getCreatedAt,
                Comparator.nullsLast(Comparator.naturalOrder())));

        for (CommentResponse n : nodes) {
            if (n.getReplies() != null && !n.getReplies().isEmpty()) {
                sortCommentTreeByCreatedAt(n.getReplies());
            }
        }
    }

    public Post getPostById(String id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        populateAuthorUser(post);
        return post;
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

        Post saved = postRepository.save(existing);
        
        // ✅ Populate author mới nhất từ DB trước khi trả về
        populateAuthorUser(saved);
        
        return saved;
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
            String authorId,
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

        /* ===== Tìm user thật từ database ===== */
        User author = null;
        if (authorId != null && !authorId.isEmpty()) {
            // Ưu tiên tìm theo ID
            author = userRepository.findById(authorId).orElse(null);
        }

        // Nếu không tìm thấy theo ID, thử tìm theo username hoặc email
        if (author == null && authorName != null && !authorName.isEmpty()) {
            author = userRepository.findByUsername(authorName).orElse(null);
            if (author == null) {
                author = userRepository.findByEmail(authorName).orElse(null);
            }
        }

        // Nếu vẫn không tìm thấy, tạo user mới (fallback cho trường hợp không đăng nhập)
        if (author == null) {
            author = new User();
            author.setId(UUID.randomUUID().toString());
            author.setUsername(authorName != null ? authorName : "Anonymous");
        }

        post.setAuthor(author);

        return postRepository.save(post);
    }

    /* ======================= UTIL ======================= */

    /**
     * Populate author User từ database dựa trên author.id hoặc author.username
     * để lấy thông tin mới nhất (bao gồm avatarUrl)
     */
    private void populateAuthorUser(Post post) {
        if (post.getAuthor() == null) return;

        User author = post.getAuthor();
        User freshUser = null;

        // Thử tìm user theo ID trước
        if (author.getId() != null && !author.getId().isEmpty()) {
            freshUser = userRepository.findById(author.getId()).orElse(null);
        }

        // Nếu không tìm thấy theo ID, thử tìm theo username
        if (freshUser == null && author.getUsername() != null && !author.getUsername().isEmpty()) {
            freshUser = userRepository.findByUsername(author.getUsername()).orElse(null);
        }

        // Nếu tìm thấy user trong database, cập nhật author với thông tin mới nhất
        if (freshUser != null) {
            post.setAuthor(freshUser);
        }

        // Populate author cho comments
        if (post.getComments() != null) {
            for (Comment comment : post.getComments()) {
                if (comment.getAuthor() != null) {
                    User commentAuthor = comment.getAuthor();
                    User freshCommentAuthor = null;

                    if (commentAuthor.getId() != null && !commentAuthor.getId().isEmpty()) {
                        freshCommentAuthor = userRepository.findById(commentAuthor.getId()).orElse(null);
                    }

                    if (freshCommentAuthor == null && commentAuthor.getUsername() != null && !commentAuthor.getUsername().isEmpty()) {
                        freshCommentAuthor = userRepository.findByUsername(commentAuthor.getUsername()).orElse(null);
                    }

                    if (freshCommentAuthor != null) {
                        comment.setAuthor(freshCommentAuthor);
                    }
                }
            }
        }
    }

    private String sanitizeFilename(String original) {
        return original
                .trim()
                .replaceAll("\\s+", "_")
                .replaceAll("[^a-zA-Z0-9._-]", "");
    }
}
