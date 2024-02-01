import type { MFPReportResponse, MFPSpec, MFPStatusResponse, MFPWmtsMatrix } from './types';
import type { WMTS } from 'ol/source.js';
/**
 * Takes a hex value and prepends a zero if it's a single digit.
 *
 * @param hex Hex value to prepend if single digit.
 * @returns hex value prepended with zero if it was single digit,
 *     otherwise the same value that was passed in.
 */
export declare function colorZeroPadding(hex: string): string;
/**
 * Converts a color from RGB to hex representation.
 *
 * @param rgb rgb representation of the color.
 * @returns hex representation of the color.
 */
export declare function rgbArrayToHex(rgb: number[]): string;
export declare function getWmtsMatrices(source: WMTS): MFPWmtsMatrix[];
export declare function asOpacity(canvas: HTMLCanvasElement, opacity: number): HTMLCanvasElement;
export declare function getAbsoluteUrl(url: string): string;
/**
 * Return the WMTS URL to use in the print spec.
 */
export declare function getWmtsUrl(source: WMTS): string;
export declare function getStatus(mfpBaseUrl: string, ref: string): Promise<MFPStatusResponse>;
export declare function requestReport(mfpBaseUrl: string, spec: MFPSpec): Promise<MFPReportResponse>;
export declare function getDownloadUrl(requestReport: string, response: MFPReportResponse, interval?: number): Promise<string>;
//# sourceMappingURL=utils.d.ts.map