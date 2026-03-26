declare module "dom-to-image-more" {
  export interface DomToImageOptions {
    width?: number;
    height?: number;
    bgcolor?: string;
    cacheBust?: boolean;
    style?: Record<string, string>;
    onclone?: (clonedNode: HTMLElement) => void;
  }

  export interface DomToImage {
    toPng(node: HTMLElement, options?: DomToImageOptions): Promise<string>;
  }

  const domtoimage: DomToImage;
  export default domtoimage;
}
