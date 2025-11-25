package com.example.demo.repository;

import com.example.demo.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PostRepository extends MongoRepository<Post, String> {

    Page<Post> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    Page<Post> findByCategoryIgnoreCase(String category, Pageable pageable);

    Page<Post> findByTitleContainingIgnoreCaseAndCategoryIgnoreCase(
            String title,
            String category,
            Pageable pageable
    );
}
