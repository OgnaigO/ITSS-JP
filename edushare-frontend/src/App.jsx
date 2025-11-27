import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Layout/Header";
import HomePage from "./pages/HomePage";
import MyPostsPage from "./pages/MyPostsPage";
import PostDetailPage from "./pages/PostDetailPage";
import PostModal from "./components/posts/PostModal";

export default function App() {
  const [isPostModalOpen, setPostModalOpen] = useState(false);

  return (
    <>
      <Header onOpenPostModal={() => setPostModalOpen(true)} />
      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setPostModalOpen(false)}
        onCreated={() => {
          // sau này có thể trigger reload list
        }}
      />
      <main className="main-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/my-posts" element={<MyPostsPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
        </Routes>
      </main>
    </>
  );
}
