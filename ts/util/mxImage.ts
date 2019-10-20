/**
 * Class: mxImage
 *
 * Encapsulates the URL, width and height of an image.
 *
 * Constructor: mxImage
 *
 * Constructs a new image.
 */
export class mxImage {
  src: any;
  width: number;
  height: number;

  constructor(src: any, width: number, height: number) {
    this.src = src;
    this.width = width;
    this.height = height;
  }
}
