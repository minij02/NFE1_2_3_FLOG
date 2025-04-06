import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import useCurationCreateStore from "./CurationCreateStore";

const InputThumbnail = styled.input`
  width: 1000px;
  height: 40px;
  font-size: 16px;
  color: #212529;
  margin: 0 auto;
  margin-top: 20px;
  border: 1px solid #7d7d7d;
  border-radius: 5px;
  padding: 8px;
  outline: none;
`;

const CurationCreateThumbnail = () => {
  const { data, setData } = useCurationCreateStore();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const imageUrl = res.data.url;
      setData({ thumbnail: imageUrl }); // Zustand에 썸네일 URL 저장
    } catch (error) {
      console.error("썸네일 업로드 실패:", error);
      alert("썸네일 업로드에 실패했습니다.");
    }
  };

  return (
    <InputThumbnail
      type="file"
      accept="image/*"
      onChange={handleUpload}
    />
  );
};

export default CurationCreateThumbnail;