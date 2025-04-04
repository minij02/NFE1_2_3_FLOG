import React, { useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

const black = "#212529";
const gray = "#7D7D7D";

const Form = styled.form`
  width: 600px;
  height: 700px;
  display: flex;
  flex-direction: column;
  border: 1px solid ${gray};
  margin: auto;
  margin-top: 200px;
`;

const Title = styled.h1`
  margin: 100px auto;
`;

const DetailForm = styled.div`
  width: 600px;
  height: 110px;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  margin-top: 20px;
  align-items: center;
`;

const TextLabel = styled.label`
  width: 400px;
  height: 20px;
  color: ${black};
`;

const Input = styled.input`
  width: 400px;
  height: 30px;
  color: ${black};
  border: 1px solid ${gray};
  border-radius: 5px;
`;

const InputIcon = styled.div`
  position: absolute;
  margin-top: 32px;
  margin-left: 360px;
  width: 18px;
  height: 12px;
  cursor: pointer;
`;

const ButtonBox = styled.div`
  display: flex;
  flex-direction: column;
  width: 400px;
  margin: 0 auto;
  margin-top: 30px;
  justify-content: space-between;
  align-items: center;
`;

const Button = styled.button`
  width: 400px;
  height: 40px;
  border: 1px solid ${gray};
  border-radius: 5px;
  color: ${black};
  background-color: #fff;
  cursor: pointer;
`;

const GoSignup = styled.div`
  width: 400px;
  height: 15px;
  color: ${gray};
  font-size: 12px;
  margin-top: 30px;
  text-align: center;
  cursor: pointer;
`;

const ErrorMessage = styled.div`
  color: red;
  font-size: 12px;
  text-align: center;
  margin-top: 10px;
`;

const SigninForm = () => {
  const navigate = useNavigate();
  // InputData
  const [inputData, setInputData] = useState({
    id: "",
    password: "",
  });

  // 비밀번호 아이콘 클릭 여부에 따라 type="text or password"
  const [isOpenPassword, setIsOpenPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [unlockTime, setUnlockTime] = useState<string | null>(null);

  // POST 요청
  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/users/login", {
        userId: inputData.id,
        password: inputData.password,
      });
      const data = await res.data;
      localStorage.setItem("userId", data.user._id);
      localStorage.setItem("token", data.token);
      localStorage.setItem("Id", data.user.userId);

      // 어드민 여부 저장
      if (data.user.isAdmin) {
        localStorage.setItem("userRole", "admin");
        console.log("로그인한 사용자는 어드민입니다.");
      } else {
        localStorage.setItem("userRole", "user");
        console.log("로그인한 사용자는 일반 유저입니다.");
      }

      console.log(`유저data${JSON.stringify(data)}`);
      alert("로그인 성공");
      navigate("/");
    } catch (error: any) {
      const errRes = error.response?.data;
      const errorMessage =
        errRes?.message || "로그인 중 알 수 없는 오류가 발생했습니다.";
      setLoginError(errorMessage);

      if (typeof errRes?.remainingAttempts === "number") {
        setRemainingAttempts(errRes.remainingAttempts);
      } else {
        setRemainingAttempts(null);
      }

      if (errRes?.unlockTime) {
        const unlock = new Date(errRes.unlockTime);
        const localTime = unlock.toLocaleString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        });
        setUnlockTime(localTime);
      } else {
        setUnlockTime(null);
      }
    }
  };

  return (
    <Form>
      <Title>로그인</Title>
      <DetailForm>
        <TextLabel>아이디</TextLabel>
        <Input
          onChange={(e) => {
            setInputData({ ...inputData, id: e.target.value });
          }}
          placeholder="아이디를 입력해주세요"
        ></Input>
      </DetailForm>
      <DetailForm>
        <TextLabel>비밀번호</TextLabel>
        <Input
          onChange={(e) => {
            setInputData({ ...inputData, password: e.target.value });
          }}
          type={isOpenPassword ? "text" : "password"}
          placeholder="비밀번호를 입력해주세요"
        ></Input>
        <InputIcon onClick={() => setIsOpenPassword((prev) => !prev)}>
          {isOpenPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
        </InputIcon>
      </DetailForm>

      {loginError && (
        <ErrorMessage>
          {loginError}
          {remainingAttempts !== null && (
            <div>남은 로그인 시도: {remainingAttempts}회</div>
          )}
          {unlockTime && <div>잠김 해제 예정 시간: {unlockTime}</div>}
        </ErrorMessage>
      )}

      <ButtonBox>
        <Button
          onClick={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          로그인
        </Button>
        <GoSignup onClick={() => navigate("/signup")}>아이디가 없으신가요? 회원가입</GoSignup>
      </ButtonBox>
    </Form>
  );
};

export default SigninForm;