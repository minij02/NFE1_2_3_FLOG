import Quill from 'quill';

const BlockEmbed = Quill.import('blots/block/embed');

export class CustomImageBlot extends BlockEmbed {
  static blotName = 'customImage';
  static tagName = 'div';
  static className = 'custom-image-block';

  static create(value: { src: string }) {
    const node = super.create();

    const img = document.createElement("img");
    img.setAttribute("alt", "업로드 이미지");

    // 이미지 src를 절대경로로 보정
    const src = value.src;
    if (src.startsWith("/api/uploaded-files")) {
      img.src = `http://localhost:5000${src}`;
    } else {
      img.src = src;
    }

    img.style.maxWidth = "100%";
    img.style.height = "auto";

    node.appendChild(img);
    return node;
  }

  static value(node: HTMLElement) {
    const img = node.querySelector('img');
    return {
      src: img?.getAttribute('src') || '',
    };
  }
}