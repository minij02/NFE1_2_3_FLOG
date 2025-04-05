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