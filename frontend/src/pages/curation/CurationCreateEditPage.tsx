import CurationCreateTitle from "../../features/curation/CurationCreateTitle";
import CurationCreateThumbnail from "../../features/curation/CurationCreateThumbnail"; // 새로운 썸네일 입력 컴포넌트
import CurationCreateDatePicker from "../../features/curation/CurationCreateDatePicker"; // 시작일/종료일 선택 컴포넌트
import CurationCreateTag from "../../features/curation/CurationCreateTag";
import CurationCreateCategory from "../../features/curation/CurationCreateCategory";
import CurationCreateEditor from "../../features/curation/CurationCreateEditor";
import CurationCreateButtons from "../../features/curation/CurationCreateButtons";
import styled from "styled-components";

// 가운데 정렬을 하기 위한 css 코드
const CurationCreateContent = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
`;

// <PostCreateTag>와 <PostCreateCategory>를 한줄로 정렬하기 위한 css코드
const TagCategoryBox = styled.div`
  width: 1000px;
  height: 50px;
  display: flex;
  flex-direction: row;
  margin: 0 auto;
  margin-top: 5px;
  justify-content: space-between;
  align-items: center;
`;

const CurationCreateEditPage = () => {
  // PostCreateTitle : 제목을 입력받기 위한 인풋창
  // PostCreateTag : 태그를 입력받기 위한 인풋창
  //
  return (
    <CurationCreateContent>
      <CurationCreateTitle />
      <CurationCreateThumbnail /> {/* 썸네일 링크 입력 */}
      <CurationCreateDatePicker /> {/* 시작일/종료일 입력 */}
      <TagCategoryBox>
        <CurationCreateTag />
        <CurationCreateCategory />
      </TagCategoryBox>
      <CurationCreateEditor />
      <CurationCreateButtons />
    </CurationCreateContent>
  );
};

export default CurationCreateEditPage;
