import User, { IUser } from "../models/userModel";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// 사용자 등록 로직을 처리하는 서비스
export const signupUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userData: IUser = req.body; // 요청 본문에서 사용자 데이터를 가져옴
    // 비밀번호 해싱 코드
    const hashedPassword = await bcrypt.hash(userData.password, 10); // salt rounds : 10회
    userData.password = hashedPassword;

    const user = new User(userData); // 회원가입 데이터 객체 생성
    await user.save(); // 회원가입 데이터 객체를 저장한다.

    res.status(201).json({ message: "회원가입을 성공하였습니다" }); // 성공 응답
  } catch (error) {
    next(error); // 오류 발생 시 다음 미들웨어로 전달
  }
};

// Admin 계정을 만드는 로직
export const createAdmin = async (userData: any) => {
  const { userId, password, nickname, profileImage, blogName, bio } = userData;

  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash(password, 10);

  // 관리자 유저 생성
  const newAdmin = await User.create({
    userId,
    password: hashedPassword,
    nickname,
    profileImage,
    blogName,
    bio,
    isAdmin: true, // 관리자로 설정
  });

  return newAdmin;
};

export const login = async (userId: string, password: string) => {
  // 사용자 확인
  const user = await User.findOne({ userId });
  if (!user) {
    throw new Error("잘못된 사용자 ID입니다.");
  }

  // 현재 계정이 잠금 상태인지 확인
  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new Error("계정이 일시적으로 잠금되었습니다. 나중에 다시 시도해주세요.");
  }

  // 비밀번호 확인
  const isMatch = await bcrypt.compare(password, user.password);
  
  if (!isMatch) {
    user.loginFailCount = (user.loginFailCount || 0) + 1;

    // 5회 이상 실패 -> 10분 동안 잠금
    if (user.loginFailCount >= 5) {
      user.lockUntil = new Date(Date.now() + 10 * 60 * 1000); // 10분
      await user.save();
      throw new Error("비밀번호를 5회 이상 틀렸습니다. 계정이 10분간 잠금됩니다.");
    }

    await user.save();
    throw new Error("잘못된 비밀번호입니다.");
  }

  // 로그인 성공 시 실패 횟수 초기화
  user.loginFailCount = 0;
  user.lockUntil = undefined;

  // JWT 토큰 생성
  const token = jwt.sign(
    { userId: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET!,
    {
      expiresIn: "1h",
    }
  );

  return {
    token,
    user: { _id: user._id, userId: user.userId, nickname: user.nickname, isAdmin: user.isAdmin },
  };
};