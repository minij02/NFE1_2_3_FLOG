import { useState, useRef, useEffect, useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import styled from "styled-components";
import useCurationCreateStore from "./CurationCreateStore";
import { Quill } from "react-quill";
import { CustomImageBlot } from "../editor/CustomImageBlot";
import { createGlobalStyle } from "styled-components";

// Quill에 커스텀 블럿 등록
Quill.register(CustomImageBlot);

// 글로벌 스타일 (삭제 버튼 포함)
const GlobalStyle = createGlobalStyle`
  .custom-image-block {
    position: relative;
    display: inline-block;
    margin: 10px 0;
  }

  .custom-image-block .delete-button {
    position: absolute;
    top: 4px;
    right: 4px;
    background-color: red;
    color: white;
    font-weight: bold;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }
`;

// 스타일 정의
const Editor = styled.div`
  width: 1000px;
  height: 800px;
  margin: 0 auto;
  margin-top: 10px;

  .ql-editor {
    font-size: 16px;
  }
`;

const CurationCreateEditor = () => {
  const { data, setData } = useCurationCreateStore();
  const [contentArray, setContentArray] = useState<string[]>(data.content);const quillRef = useRef<ReactQuill>(null);

  const formats = ["size", "align", "color", "background", "bold", "italic", "underline", "strike", "blockquote", "list", "bullet", "indent", "link", "image", "customImage"];

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
        [{ size: ["huge", "large", false, "small"] }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
        ["link", "image"],
      ],
      handlers: {
        image: () => handleImageUpload(),
      },
    }
  }),[]);

  useEffect(() => {
    // Zustand store에 업데이트
    setData({ content: contentArray });
  }, [contentArray]);

  // Quill 에디터의 내용을 배열로 관리하여 업데이트
  const handleEditorChange = (content: string) => {
    setContentArray((prev) => {
      const newContentArray = [...prev];
      newContentArray[0] = content; // 배열의 첫 번째 요소로 설정하거나, 로직에 맞게 변경 가능
      return newContentArray;
    });
  };

    // 이미지 업로드 및 삽입
    const handleImageUpload = () => {
      const input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("accept", "image/*");
  
      input.addEventListener("change", async () => {
        const file = input.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
            const editor = quillRef.current?.getEditor();
            const range = editor?.getSelection();
            if (editor && range) {
              editor.insertEmbed(range.index, "customImage", { src: base64 });
              editor.setSelection(range.index + 1);
            }
          };
          reader.readAsDataURL(file);
        }
      });
  
      input.click();
    };

  return (
    <>
      <GlobalStyle />
      <Editor>
        <ReactQuill
          ref={quillRef}
          style={{ width: "100%", height: "100%" }}
          theme="snow"
          value={contentArray[0] || ""}
          modules={modules}
          formats={formats}
          onChange={handleEditorChange}
          placeholder="내용을 입력하세요."
        />
      </Editor>
    </>
  );
};

export default CurationCreateEditor;