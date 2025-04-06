import { Request, Response } from "express";
import path from "path";
import fs from "fs";

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "파일이 업로드되지 않았습니다." });
      return;
    }

    const url = `/api/uploaded-files/${req.file.filename}`;
    res.status(200).json({ success: true, url });
  } catch (error) {
    res.status(500).json({ success: false, message: "업로드 처리 중 오류 발생" });
  }
};

export const serveUploadedFile = (req: Request, res: Response): void => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "../../uploads", filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ success: false, message: "파일을 찾을 수 없습니다." });
  }
};