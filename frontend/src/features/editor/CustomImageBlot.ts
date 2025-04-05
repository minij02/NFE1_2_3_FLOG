import Quill from 'quill';

const BlockEmbed = Quill.import('blots/block/embed');

export class CustomImageBlot extends BlockEmbed {
  static blotName = 'customImage';
  static tagName = 'div';
  static className = 'custom-image-block';

  static create(value: { src: string }) {
    const node = super.create() as HTMLElement;

    const img = document.createElement('img');
    img.setAttribute('src', value.src);
    img.style.maxWidth = '100%';

    const btn = document.createElement('button');
    btn.className = 'delete-button';
    btn.textContent = '×';
    btn.onclick = () => {
      const blot = Quill.find(node);
      if (blot) blot.remove();
    };

    node.appendChild(img);
    node.appendChild(btn);
    return node;
  }

  static value(node: HTMLElement) {
    const img = node.querySelector('img');
    return {
      src: img?.getAttribute('src') || '',
    };
  }
}