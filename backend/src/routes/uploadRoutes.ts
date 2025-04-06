import express from "express";
import upload from "../middlewares/uploadMiddleware";
import { uploadImage, serveUploadedFile } from "../controllers/uploadController";

const router = express.Router();

// 이미지 업로드
router.post("/api/upload", upload.single("image"), (req, res, next) => {
    console.log("이미지 업로드 요청 도착!");
    next();
  },uploadImage);

// 업로드된 이미지 서빙
router.get("/api/uploaded-files/:filename", serveUploadedFile);

export default router;