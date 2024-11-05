import styled from "styled-components";
import CurationItem from "../../features/curation/CurationItem";
import SearchIcon from "./asset/CurationBlackSearch.svg";
import CategoryModal from "../../shared/components/categoryModal/CategoryModal";
import { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

interface KeywordTypes {
  gender: string[];
  age: string[];
  style: string[];
}
interface CurationDataTypes {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  content: string[];
  entries: string[];
  likes: string[];
  comments: string[];
  createdAt: string;
  updatedAt: string;
  status: string;
  genderFilter: string[];
  ageFilter: string[];
  styleFilter: string[];
  thumbnail: string;
}

const SearchResultsPageWrap = styled.section`
  width: 997px;
  margin: 50px auto 0;
`;

const SearchResultSearchWrap = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 20px 36px;
  border: 1px solid #7d7d7d;
  border-radius: 20px;
  width: 100%;
  box-sizing: border-box;
`;

const SearchResultsPageInput = styled.input`
  appearance: none;
  border: none;
  outline: none;
  padding: 0;
  background-color: transparent;
  font-size: 28px;
  color: #212529;
  letter-spacing: -0.025em;
  &::placeholder {
    color: #ccc;
  }
`;

const SearchResultsPageButton = styled.button`
  appearance: none;
  border: none;
  outline: none;
  padding: 0;
  background-color: transparent;
  cursor: pointer;
`;

const SearchResultSetCategoryText = styled.p`
  font-size: 14px;
  color: #7d7d7d;
  text-align: right;
  margin: 25px 35px 0 0;
  cursor: pointer;
`;

const SearchResultListWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 30px;
  margin-top: 20px;
`;

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const SearchCurationPage = () => {
  const location = useLocation();
  const query = useQuery();
  const navigate = useNavigate();

  // 카테고리 모달 상태 관리
  const [modalStatus, setModalStatus] = useState(false);

  // 렌더링할 큐레이션 리스트 저장
  const [curationList, setCurationList] = useState<CurationDataTypes[]>([]);

  const params = new URLSearchParams(window.location.search);
  const queryWord: string | null = params.get("query");
  const searchWord = decodeURIComponent(queryWord || "");
  const [selectedCategories, setSelectedCategories] = useState<KeywordTypes>({
    gender: [],
    age: [],
    style: [],
  });

  // 검색창 인풋 onchange하면 받는 값
  const [searchValue, setSearchValue] = useState("");

  // 카테고리 모달 핸들 함수
  const handleModal = () => {
    setModalStatus(true);
  };

  // 카테고리 모달 props 함수
  const onModal = () => {
    setModalStatus(false);
  };

  // 키워드 지정
  const onEditKeyword = (key: keyof KeywordTypes, value: string[]) => {
    setSelectedCategories((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // 검색 기능 함수
  const loadData = async (
    queryString: string,
    genderString: string[],
    ageString: string[],
    styleString: string[]
  ) => {
    try {
      const response = await axios.get<{ curations: CurationDataTypes[] }>(
        "http://localhost:5000/search/curations",
        {
          params: {
            query: queryString,
            gender: genderString,
            age: ageString,
            style: styleString,
          },
        }
      );
      setCurationList(response.data.curations);
    } catch (err) {
      console.error("API 호출 에러", err);
    }
  };

  // 재검색 기능 함수 (FormEvent)
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!searchValue || searchValue.length < 2) {
      return alert("검색어는 최소 두 글자 이상 입력해주세요");
    }

    setCurationList([]);
    loadData(
      searchValue,
      selectedCategories.gender,
      selectedCategories.age,
      selectedCategories.style
    );

    let searchUrl = "/search/curations/";
    searchUrl += `?query=${searchValue}`;
    if (selectedCategories.gender) {
      searchUrl += `&gender=${selectedCategories.gender}`;
    }
    if (selectedCategories.age) {
      searchUrl += `&age=${selectedCategories.age}`;
    }
    if (selectedCategories.style) {
      searchUrl += `&style=${selectedCategories.style}`;
    }
    navigate(searchUrl);
  };

  // 검색한 쿼리 기반 데이터 로드
  useEffect(() => {
    return () => {
      const queryStr = query.get("query") || "";
      const genderStrArray = query.get("gender")
        ? query.get("gender")!.split(",")
        : [];
      const ageStrArray = query.get("age") ? query.get("age")!.split(",") : [];
      const styleStrArray = query.get("style")
        ? query.get("style")!.split(",")
        : [];

      if (queryStr) {
        loadData(queryStr, genderStrArray, ageStrArray, styleStrArray);
      }
    };
  }, []);

  return (
    <SearchResultsPageWrap>
      {/* 상단 검색창 폼 */}
      <form onSubmit={(e) => handleSearchSubmit(e)}>
        <SearchResultSearchWrap>
          {/* 상단 검색창 인풋 */}
          <SearchResultsPageInput
            type="text"
            placeholder={searchWord ? searchWord : "검색어를 입력해주세요"}
            onChange={(e) => setSearchValue(e.target.value)}
          />

          {/* 상단 검색창 검색 버튼 */}
          <SearchResultsPageButton>
            <img src={SearchIcon} alt="검색" />
          </SearchResultsPageButton>
        </SearchResultSearchWrap>

        {/* 상단 검색창 카테고리 설정 */}
        <SearchResultSetCategoryText onClick={handleModal}>
          카테고리 설정
        </SearchResultSetCategoryText>
        {modalStatus ? (
          <CategoryModal
            onModal={onModal}
            onEditKeyword={onEditKeyword}
            selectedCategories={selectedCategories}
          />
        ) : null}
      </form>
      <SearchResultListWrap>
  {curationList && curationList.length !== 0 ? (
    curationList.map((curation) => (
      <CurationItem
        key={curation._id}
        curationId={curation._id}
        title={curation.title}
        startDate={curation.startDate}
        endDate={curation.endDate}
        contentPreview={curation.content.join("\n")}  // 배열을 문자열로 변환
        entries={curation.entries}
        likes={curation.likes}
        comments={curation.comments}
        thumbnail={curation.thumbnail}
      />
    ))
  ) : (
    <div>검색결과가 없습니다.</div>
  )}
</SearchResultListWrap>
    </SearchResultsPageWrap>
  );
};

export default SearchCurationPage;
