import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

// Styled Components
const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TitleInput = styled.input`
  width: 100%;
  padding: 10px;
  font-size: 16px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const ImageUploadWrapper = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const ImageBox = styled.label`
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f8f8f8;
  cursor: pointer;
  font-size: 24px;
  color: #aaa;
  
  & input {
    display: none;
  }
`;

const ImagePreviewWrapper = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 2px;
  right: 2px;
  background-color: red;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  z-index: 1;
`;

const DescriptionInput = styled.input`
  width: 100%;
  padding: 10px;
  font-size: 16px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const SubmitButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  color: #fff;
  background-color: #333;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;


const CurationSubmissionPage: React.FC = () => {
  const { curationId } = useParams<{ curationId: string }>(); // URL에서 curationId 추출
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [images, setImages] = useState<string[]>([]); // 파일 URL 배열로 변경
  const [description, setDescription] = useState('');

    // 만약 curationId가 없다면 이전 페이지로 돌아가게 하는 로직
    useEffect(() => {
      if (!curationId) {
        alert("큐레이션 ID가 누락되었습니다.");
        navigate(-1);
      }
    }, [curationId, navigate]);

    // 이미지 클릭 -> 파일 선택 -> 서버 업로드
const handleAddImage = async () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';

  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;

    if (images.length >= 3) {
      alert('이미지는 최대 3장까지 업로드할 수 있습니다.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrl = res.data.url;
      setImages((prev) => [...prev, uploadedUrl]);
    } catch (err) {
      console.error('이미지 업로드 실패:', err);
      alert('이미지 업로드에 실패했습니다.');
    }
  };

  input.click();
};

// 이미지 삭제
const handleDeleteImage = (index: number) => {
  setImages((prev) => prev.filter((_, i) => i !== index));
};

    const handleImageBoxClick = async (index: number) => {
      const url = prompt("이미지 URL을 입력하세요:");
      if (url) {
        setImages((prevImages) => {
          const newImages = [...prevImages];
          newImages[index] = url;
          return newImages;
        });
      }
    };  

  // Handle form submission
  const handleSubmit = async () => {
    if (!curationId) return;

    const filteredImages = images.filter((url) => url.trim() !== '');

    const entryData = {
      curationId,
      title,
      photos: images, // 업로드한 URL 경로 사용
      description,
    };

    try {
      await axios.post(`http://localhost:5000/api/curations/${curationId}/entry`, entryData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
        },
      });
      alert('큐레이션이 성공적으로 제출되었습니다.');
      navigate(`/curations/${curationId}`);
    } catch (error) {
      console.error('큐레이션 제출 중 오류 발생:', error);
      alert('큐레이션 제출에 실패했습니다.');
    }
  };

  return (
    <Container>

      {/* 제목 입력 */}
      <TitleInput
        type="text"
        placeholder="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* 사진 업로드 */}
      <ImageUploadWrapper>
  {images.map((img, idx) => (
    <ImagePreviewWrapper key={idx}>
      <DeleteButton onClick={() => handleDeleteImage(idx)}>×</DeleteButton>
      <img
        src={`http://localhost:5000${img}`}
        alt={`이미지 ${idx + 1}`}
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '5px' }}
      />
    </ImagePreviewWrapper>
  ))}
  {images.length < 3 && (
    <ImageBox onClick={handleAddImage}>
      <span>+</span>
    </ImageBox>
  )}
</ImageUploadWrapper>

      {/* 한 줄 설명 입력 */}
      <DescriptionInput
        type="text"
        placeholder="20자 이내로 작성하세요"
        maxLength={20}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* 제출 버튼 */}
      <SubmitButton onClick={handleSubmit}>제출</SubmitButton>
    </Container>
  );
};

export default CurationSubmissionPage;