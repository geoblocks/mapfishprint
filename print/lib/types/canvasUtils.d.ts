/**
 *
 * @param inCanvas input canvas
 * @param opacity input opacity
 * @return same or new canvas drawn with given opacity
 */
export declare function asOpacity(inCanvas: HTMLCanvasElement, opacity: number): HTMLCanvasElement;
/**
 * When the printed area is defined in cms on paper, this function can be used
 * to compute the size of the pixel-perfect image, in dots/pixels.
 * @param dimensions the dimensions of the printed area, on the paper, in cm
 * @param dpi the resolution of the printer
 * @return the dimensions of the canvas, in pixels
 */
export declare function canvasSizeFromDimensionsInCm(dimensions: [number, number], dpi: number): [number, number];
/**
 * When the printed area is defined in pdf points, this function can be used
 * to compute the size of the pixel-perfect image, in dots/pixels.
 * @param dimensions the dimensions of the printed area, on the pdf, in pdf points
 * @param dpi the resolution of the printer
 * @return the dimensions of the canvas, in pixels
 */
export declare function canvasSizeFromDimensionsInPdfPoints(dimensions: [number, number], dpi: number): [number, number];
