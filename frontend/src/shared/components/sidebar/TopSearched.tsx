import styled from "styled-components";

import { searchData } from "./mockData";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

interface RankColor {
  isTopRank: number;
}

interface TopSearchTypes {
  _id: string;
  query: string;
  searchCount: number;
  createdAt: string;
}

const TopSearchedTopWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TopSearchedTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #212529;
`;

const TopSearchedText = styled.p`
  font-size: 14px;
  color: #212529;
`;

const TopSearchedChart = styled.div`
  display: flex;
  justify-content: center;
  align-items: space-between;
  flex-direction: column;
  margin-top: 20px;
`;

const TopSearchedKeywordWrap = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 16px;
  &:not(:first-child) {
    margin-top: 20px;
  }
`;

const TopSearchedRank = styled.div<RankColor>`
  color: ${({ isTopRank }) => (isTopRank <= 3 ? "#ff0303" : "#212529")};
`;

const TopSearched = () => {

  // 인기 검색어 리스트
  const [searchList, setSearchList] = useState<TopSearchTypes[] | null>(null);

  // 기준 시간 구하기
  const getTime = () => {
    const date = new Date();

    const month = (date.getMonth() + 1);
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();

    return `${("00" + month.toString()).slice(-2)}.${("00" + day.toString()).slice(-2)}.${("00" + hour.toString()).slice(-2)}:${("00" + minute.toString()).slice(-2)} 기준`;
  }

  // 인기 검색어 리스트 state에 return
  useEffect(() => {
    const loadTopSearched = async () => {
      try {
        const response = await axios.get('http://localhost:5000/search/trending');
        const copySearchData = [...response.data.trendingSearches];
        // searchCount 순으로 정렬후 5개만 가져오기
        const sortingData = copySearchData.sort((a, b) => {
          return b.searchCount - a.searchCount;
        });
        const slicedData = sortingData.slice(0, 5);
        setSearchList(slicedData)
      } catch (err) {
        console.error("API 통신 오류", err)
      }
    }

    return () => {
      loadTopSearched();
    }
  }, []);

  return (
    <div style={{ width: "100%" }}>
      {/* 인기 검색어 상단 */}
      <TopSearchedTopWrapper>
        <TopSearchedTitle>인기 검색어</TopSearchedTitle>
        <TopSearchedText>{ getTime() }</TopSearchedText>
      </TopSearchedTopWrapper>
      {/* 인기 검색어 리스트 */}
      <TopSearchedChart>
        <TopSearchedText>
          {/* 인기 검색어 */}
          {searchList &&
            searchList.map((search, index) => {
              return (
                <TopSearchedKeywordWrap>
                  <TopSearchedRank isTopRank={index + 1}>
                    {index + 1}
                  </TopSearchedRank>
                  <Link to={`/search/?query=${search.query}`}>
                    <span>{search.query}</span>
                  </Link>
                </TopSearchedKeywordWrap>
              );
            })}
        </TopSearchedText>
      </TopSearchedChart>
    </div>
  );
};

export default TopSearched;
