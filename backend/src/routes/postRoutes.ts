import { Router } from "express";
import { getPost, Like, Bookmark, getPostList } from "../controllers/postController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { createPost, editPost, saveDraft, getDraftedPost } from "../controllers/postController";

const router = Router();

router.get("/api/posts", getPostList); // 각 페이지 별 리스트 렌더링
router.get("/api/posts/draftedpost", authMiddleware, getDraftedPost); // 임시저장된 포스트 불러오기 API
router.get("/api/posts/:postId", getPost);
router.post("/api/posts/:postId/like", authMiddleware, Like);
router.post("/api/posts/:postId/bookmark", authMiddleware, Bookmark);
router.delete("/api/posts/:postId/bookmark", authMiddleware, Bookmark);
router.post("/api/posts/create", authMiddleware, createPost); // 포스트 생성 API
router.post("/api/posts/draft", authMiddleware, saveDraft); // 포스트 임시저장 API
router.put("/api/posts/update", authMiddleware, editPost); // 포스트 수정 API

export default router;
