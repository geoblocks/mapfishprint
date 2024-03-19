import type { MFPCancelResponse, MFPReportResponse, MFPSpec, MFPStatusResponse, MFPWmtsMatrix } from './types';
import type { WMTS } from 'ol/source.js';
import type { Extent } from 'ol/extent';
/**
 * @param mapPageSize The page size in pixels (width, height)
 * @param center The coordinate of the extent's center.
 * @param scale The scale to calculate the extent width.
 * @returns an extent that fit the page size. Calculated with DPI_PER_DISTANCE_UNIT (by default using meters)
 */
export declare function getPrintExtent(mapPageSize: number[], center: number[], scale: number): Extent;
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
export declare function cancelPrint(mfpBaseUrl: string, ref: string): Promise<MFPCancelResponse>;
export declare function requestReport(mfpBaseUrl: string, spec: MFPSpec): Promise<MFPReportResponse>;
/**
 * @param requestReport the name of the requested report
 * @param response The initial print response.
 * @param interval (s) the internal to poll the download url.
 * @param timeout (s) A timeout for this operation.
 * @returns a Promise with the download url once the document is printed or an error.
 */
export declare function getDownloadUrl(requestReport: string, response: MFPReportResponse, interval?: number, timeout?: number): Promise<string>;
//# sourceMappingURL=utils.d.ts.map