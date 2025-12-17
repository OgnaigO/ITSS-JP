package com.example.demo.service;

import com.example.demo.model.Post;
import org.springframework.stereotype.Component;

@Component
public class ExplainPromptBuilder {

    public String build(Post post, String level) {

        String slidesInfo = post.getSlideUrls().isEmpty()
                ? "Không có slide đính kèm."
                : "Có slide bài giảng đính kèm.";

        return """
        Nhiệm vụ:
        Giải thích nội dung bài giảng dưới dạng tài liệu học tập.

        Yêu cầu bắt buộc:
        - Trình bày trực tiếp nội dung kiến thức, KHÔNG chào hỏi, KHÔNG xưng hô.
        - Không dùng các câu mở đầu như "Chào các em", "Với vai trò là giảng viên".
        - Văn phong trung lập, học thuật, giống sách hoặc giáo trình.
        - Viết bằng tiếng Việt, rõ ràng, mạch lạc.
        - Chỉ sử dụng thông tin từ nội dung được cung cấp.

        Định dạng trả về (CHỈ JSON):
        {
          "summary": "Tóm tắt nội dung chính của bài giảng",
          "explanation": "Giải thích chi tiết nội dung bài giảng, trình bày trực tiếp kiến thức",
          "key_points": [
            "Ý chính quan trọng 1",
            "Ý chính quan trọng 2"
          ],
          "suggested_tags": [
            "tag1",
            "tag2"
          ]
        }

        Thông tin bài giảng:

        Tiêu đề:
        %s

        Nội dung mô tả:
        %s

        Danh mục:
        %s

        Slide:
        %s
        """.formatted(
                post.getTitle(),
                post.getDescription(),
                post.getCategory(),
                slidesInfo
        );
    }
}

