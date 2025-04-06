import { useState, useRef, useEffect, useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import styled from "styled-components";
import useCurationCreateStore from "./CurationCreateStore";
import axios from "axios";
import { Quill } from "react-quill";
import { Delta } from "quill";
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
  const [deltaContent, setDeltaContent] = useState(data.content || null);
  const getHTMLFromDelta = (delta: Delta | null) => {
    const editor = quillRef.current?.getEditor();
    if (!editor || !delta) return "";
    const tempContainer = document.createElement("div");
    const tempEditor = new Quill(tempContainer);
    tempEditor.setContents(delta);
    return tempContainer.querySelector(".ql-editor")?.innerHTML || "";
  };
  const quillRef = useRef<ReactQuill>(null);

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
    setData({ content: deltaContent });
  }, [deltaContent]);

  // HTML -> Delta 초기화
  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (!editor || !data.content) return;
  
    try {
      // Delta 타입인지 확인하고 적용
      if ((data.content as Delta).ops && Array.isArray((data.content as Delta).ops)) {
        editor.setContents(data.content as Delta);
      }
    } catch (err) {
      console.warn("setContents failed:", err);
    }
  }, []);
  
   // X 버튼은 렌더링 후 DOM 조작으로 삽입
   useEffect(() => {
    const editorEl = document.querySelector(".ql-editor");
    if (!editorEl) return;

    const addDeleteButtons = () => {
      const imageBlocks = editorEl.querySelectorAll(".custom-image-block");
      imageBlocks.forEach((block) => {
        if (!block.querySelector(".delete-button")) {
          const btn = document.createElement("button");
          btn.className = "delete-button";
          btn.textContent = "×";
          btn.onclick = () => block.remove();
          block.appendChild(btn);
        }
      });
    };

    const observer = new MutationObserver(addDeleteButtons);
    observer.observe(editorEl, { childList: true, subtree: true });

    // 처음 실행
    addDeleteButtons();

    return () => observer.disconnect();
  }, []);

  // Quill 에디터의 내용을 배열로 관리하여 업데이트
  const handleEditorChange = (_: string, __: any, ___: string, editor: any) => {
    const delta = editor.getContents();
    setDeltaContent(delta);
  };

    // 이미지 업로드 및 삽입
    const handleImageUpload = () => {
      const input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("accept", "image/*");
    
      input.addEventListener("change", async () => {
        const file = input.files?.[0];
        if (file) {
          const formData = new FormData();
          formData.append("image", file);
    
          try {
            const res = await axios.post("http://localhost:5000/api/upload", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
    
            const imageUrl = res.data.url;
            const editor = quillRef.current?.getEditor();
            const range = editor?.getSelection();
    
            if (editor && range) {
              editor.insertEmbed(range.index, "customImage", { src: imageUrl });
              editor.setSelection(range.index + 1);
            }
          } catch (error) {
            console.error("이미지 업로드 실패", error);
            alert("이미지 업로드에 실패했습니다.");
          }
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