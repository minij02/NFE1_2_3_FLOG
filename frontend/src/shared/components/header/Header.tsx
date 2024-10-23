import styled from "styled-components";
import Logo from "./asset/Logo.svg";
import { useEffect, useState } from "react";

interface HeaderScrollbar {
  scrollbarWidth?: string;
}

interface HeaderFlexWrapProps {
  isEnd?: boolean;
}

const HeaderWrap = styled.header<HeaderScrollbar>`
  width: 100%;
  max-width: 1780px;
  height: 92px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;
  position: relative;
  &::after {
    content: "";
    display: block;
    width: ${({ scrollbarWidth = "0px" }) => `calc(100vw - ${scrollbarWidth})`};
    height: 1px;
    background-color: #393939;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 0;
  }
`;

const HeaderFlexWrap = styled.div<HeaderFlexWrapProps>`
  display: flex;
  justify-content: ${({ isEnd }) => (isEnd ? "flex-end" : "flex-start")};
  align-items: center;
`;

const HeaderCate = styled.div`
  font-size: 18px;
  font-weight: 400;
  margin-left: 40px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 20px;
`;

const HeaderLogo = styled.div`
  width: 100px;
  & > img {
    width: 100%;
    display: block;
  }
`

const Header = () => {
  const [scrollbarWidth, setScrollbarWidth] = useState("0px");
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    const scrollbarWidthValue = `${window.innerWidth - document.documentElement.clientWidth}px`;
    setScrollbarWidth(scrollbarWidthValue);
  }, []);

  return (
    <HeaderWrap id="header" scrollbarWidth={scrollbarWidth}>
      {/* 헤더 좌측 로고, 카테고리 */}
      <HeaderFlexWrap isEnd={false}>
        <HeaderLogo id="logoImg">
          <img src={Logo} alt="Flog" />
        </HeaderLogo>
        <HeaderCate>
          <span>일정</span>
          <span>큐레이션</span>
          <span>가게홍보</span>
        </HeaderCate>
      </HeaderFlexWrap>
      {/* 헤더 우측 기능관련 */}
      <HeaderFlexWrap isEnd={true}>
        {isLogin ? (
          <HeaderCate>
            <span>글쓰기</span>
            <span>로그아웃</span>
            <span>알림</span>
            <span>마이페이지</span>
          </HeaderCate>
        ) : (
          <HeaderCate>로그인</HeaderCate>
        )}
      </HeaderFlexWrap>
    </HeaderWrap>
  );
};

export default Header;
