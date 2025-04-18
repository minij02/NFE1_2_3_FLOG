import { Request, Response } from "express";
import User from "../models/userModel";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";

// 프로필 사진 업로드 컨트롤러
export const uploadProfileImage = async (req: Request, res: Response) => {
  try {
    const { profileImage } = req.body;

    // Base64 문자열에서 'data:image/png;base64,' 부분 제거
    const base64Data = profileImage.replace(/^data:image\/png;base64,/, "");

    // 저장할 파일 경로 설정
    const filePath = path.join(__dirname, "../uploads/profile-images"); // 업로드 디렉토리 경로
    const fileName = `profile_${req.user?.id}.png`; // 사용자 ID에 기반한 파일 이름

    // 디렉토리가 존재하지 않으면 생성
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true });
    }

    // 파일 저장
    fs.writeFileSync(path.join(filePath, fileName), base64Data, {
      encoding: "base64",
    });

    // 성공 응답
    res.json({
      success: true,
      message: "프로필 사진이 성공적으로 업로드되었습니다.",
    });
    return;
  } catch (error) {
    console.error("프로필 사진 업로드 중 오류 발생:", error);
    res
      .status(500)
      .json({ success: false, message: "프로필 사진 업로드 실패" });
    return;
  }
};
// 비밀번호 변경 컨트롤러
export const updatePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  const userId = req.params.userId;
  console.log(userId);
  if (!userId) {
    res
      .status(401)
      .json({ success: false, message: "인증된 사용자가 아닙니다." });
    return;
  }

  console.log(userId);

  try {
    // 사용자 조회
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
      return;
    }

    // 현재 비밀번호가 일치하는지 확인
    const isPasswordMatch = await user.comparePassword(currentPassword);
    if (!isPasswordMatch) {
      res.status(400).json({ message: "현재 비밀번호가 일치하지 않습니다." });
      return;
    }

    // 새 비밀번호와 비밀번호 확인이 일치하는지 검증
    if (newPassword !== confirmNewPassword) {
      res
        .status(400)
        .json({ message: "새 비밀번호가 서로 일치하지 않습니다." });
      return;
    }
    // 새 비밀번호 해싱
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // 비밀번호 업데이트
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "비밀번호가 성공적으로 변경되었습니다." });
  } catch (error) {
    console.error("비밀번호 변경 중 오류:", error);
    res
      .status(500)
      .json({ message: "비밀번호 변경 중 오류가 발생했습니다.", error });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { nickname, profileImage, bio, blogName, lifetimeItem } = req.body;

  try {
    // 사용자 찾기
    const user = await User.findById(userId);
    if (!user) {
      res
        .status(404)
        .json({ success: false, message: "사용자를 찾을 수 없습니다." });
      return;
    }

    // 필드 업데이트
    if (nickname) user.nickname = nickname;
    if (profileImage) user.profileImage = profileImage; // 프로필 이미지 업데이트
    if (bio) user.bio = bio;
    if (blogName) user.blogName = blogName;
    if (lifetimeItem)
      user.lifetimeItem = { ...user.lifetimeItem, ...lifetimeItem };

    // 저장
    await user.save();

    // 성공 응답
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      updatedProfile: {
        nickname: user.nickname,
        profileImage: user.profileImage,
        bio: user.bio,
        blogName: user.blogName,
        lifetimeItem: user.lifetimeItem,
      },
    });
    return;
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "서버 오류가 발생했습니다." });
    return;
  }
};

// 프로필 조회
export const getProfile = async (req: Request, res: Response) => {
  const userId = req.params.userId;

  try {
    const user = await User.findOne({ userId }).populate(
      "followers following posts bookmarkedPosts"
    );
    if (!user) {
      res
        .status(404)
        .json({ success: false, message: "사용자를 찾을 수 없습니다." });
      return;
    }

    res.status(200).json({
      userId: user._id,
      Id: user.userId,
      nickname: user.nickname,
      profileImage: user.profileImage,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: user.posts,
      bookmarkedPosts: user.bookmarkedPosts,
      tier: user.tier,
      points: user.points,
      lifetimeItem: user.lifetimeItem,
      blogName: user.blogName,
    });
    return;
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "서버 오류가 발생했습니다." });
    return;
  }
};

//타입에 따라 북마크한 글, 또는 작성한 글 모아보기
// 포스트 정보를 반환하는 함수
const formatPosts = async (posts: any) => {
  return Promise.all(
    posts.map(async (post: any) => {
      // authorId를 이용해 작성자의 정보를 조회
      const author = await User.findById(post.author); // authorId를 사용
      console.log(author);
      return {
        postId: post._id,
        title: post.title,
        content: post.content,
        author: {
          userId: author ? author._id : null,

          nickname: author ? author.nickname : "Unknown", // 작성자가 없을 경우 기본값
        },
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      };
    })
  );
};

// 사용자 글 목록 조회 컨트롤러
export const getUserItems = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const type = req.params.type; // "bookmarks" 또는 "posts"

  try {
    // 사용자 찾기
    const user = await User.findById(userId)
      .populate("bookmarkedPosts")
      .populate("posts");
    if (!user) {
      res
        .status(404)
        .json({ success: false, message: "사용자를 찾을 수 없습니다." });
      return;
    }

    let items;

    // 타입에 따라 다른 데이터 조회
    if (type === "bookmarks") {
      items = await formatPosts(user.bookmarkedPosts);
    } else if (type === "userPosts") {
      items = await formatPosts(user.posts);
    } else {
      res
        .status(400)
        .json({ success: false, message: "유효하지 않은 타입입니다." });
      return;
    }

    // 성공 응답
    res.status(200).json({
      success: true,
      items: items,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};
