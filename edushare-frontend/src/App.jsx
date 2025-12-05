// src/App.jsx
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Layout/Header";
import HomePage from "./pages/HomePage";
import MyPostsPage from "./pages/MyPostsPage";
import PostDetailPage from "./pages/PostDetailPage";
import PostModal from "./components/posts/PostModal";

export default function App() {
  const [isPostModalOpen, setPostModalOpen] = useState(false);

  // text trong ô "Search posts..." trên header
  const [searchText, setSearchText] = useState("");

  // để các page biết khi nào có post mới và reload lại
  const [reloadFlag, setReloadFlag] = useState(0);

  const handlePostCreated = (newPost) => {
    console.log("Post created: ", newPost);
    setReloadFlag((f) => f + 1); // kích HomePage + MyPostsPage reload
  };

  const handleSearchChange = (value) => {
    setSearchText(value);
  };

  return (
    <>
      <Header
        searchValue={searchText}
        onSearchChange={handleSearchChange}
        onSearchSubmit={() => {
          // hiện tại HomePage/MyPostsPage filter realtime nên không cần làm gì thêm
        }}
        onOpenPostModal={() => setPostModalOpen(true)}
      />

      {/* Modal tạo bài viết – dùng chung cho toàn app */}
      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setPostModalOpen(false)}
        onCreated={(post) => {
          handlePostCreated(post);
          setPostModalOpen(false);
        }}
      />

      <main className="main-container">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage externalSearch={searchText} reloadFlag={reloadFlag} />
            }
          />
          <Route
            path="/my-posts"
            element={
              <MyPostsPage
                externalSearch={searchText}
                reloadFlag={reloadFlag}
              />
            }
          />
          <Route path="/posts/:id" element={<PostDetailPage />} />
        </Routes>
      </main>
    </>
  );
}
