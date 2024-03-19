import WMTSTileGrid from 'ol/tilegrid/WMTS.js';
import {toSize} from 'ol/size.js';
import type {MFPCancelResponse, MFPReportResponse, MFPSpec, MFPStatusResponse, MFPWmtsMatrix} from './types';
import type {WMTS} from 'ol/source.js';
import type {Extent} from 'ol/extent';
import {Constants, CalculatedConstants} from './constants';

/**
 * @param mapPageSize The page size in pixels (width, height)
 * @param center The coordinate of the extent's center.
 * @param scale The scale to calculate the extent width.
 * @returns an extent that fit the page size. Calculated with DPI_PER_DISTANCE_UNIT (by default using meters)
 */
export function getPrintExtent(mapPageSize: number[], center: number[], scale: number): Extent {
  const [mapPageWidthMeters, mapPageHeightMeters] = mapPageSize.map(
    (side) => ((side / CalculatedConstants.DPI_PER_DISTANCE_UNIT()) * scale) / 2,
  );
  return [
    center[0] - mapPageWidthMeters,
    center[1] - mapPageHeightMeters,
    center[0] + mapPageWidthMeters,
    center[1] + mapPageHeightMeters,
  ];
}

/**
 * Takes a hex value and prepends a zero if it's a single digit.
 *
 * @param hex Hex value to prepend if single digit.
 * @returns hex value prepended with zero if it was single digit,
 *     otherwise the same value that was passed in.
 */
export function colorZeroPadding(hex: string): string {
  return hex.length === 1 ? `0${hex}` : hex;
}

/**
 * Converts a color from RGB to hex representation.
 *
 * @param rgb rgb representation of the color.
 * @returns hex representation of the color.
 */
export function rgbArrayToHex(rgb: number[]): string {
  const r = rgb[0];
  const g = rgb[1];
  const b = rgb[2];
  if (r !== (r & 255) || g !== (g & 255) || b !== (b & 255)) {
    throw new Error(`"(${r},${g},${b})" is not a valid RGB color`);
  }
  const hexR = colorZeroPadding(r.toString(16));
  const hexG = colorZeroPadding(g.toString(16));
  const hexB = colorZeroPadding(b.toString(16));
  return `#${hexR}${hexG}${hexB}`;
}

export function getWmtsMatrices(source: WMTS): MFPWmtsMatrix[] {
  const projection = source.getProjection()!;
  const tileGrid = source.getTileGrid() as WMTSTileGrid;
  console.assert(tileGrid instanceof WMTSTileGrid);

  const matrixIds = tileGrid.getMatrixIds();
  const wmtsMatrices: MFPWmtsMatrix[] = [];
  const metersPerUnit = projection.getMetersPerUnit()!;
  console.assert(!!metersPerUnit);

  for (let i = 0; i < matrixIds.length; i++) {
    const tileRange = tileGrid.getFullTileRange(i);
    const resolutionMeters = tileGrid.getResolution(i) * metersPerUnit;
    wmtsMatrices.push({
      identifier: matrixIds[i],
      scaleDenominator: resolutionMeters / Constants.WMTS_PIXEL_SIZE,
      tileSize: toSize(tileGrid.getTileSize(i)),
      topLeftCorner: tileGrid.getOrigin(i),
      matrixSize: [tileRange.maxX - tileRange.minX, tileRange.maxY - tileRange.minY],
    } as MFPWmtsMatrix);
  }

  return wmtsMatrices;
}

const scratchOpacityCanvas = document.createElement('canvas');
export function asOpacity(canvas: HTMLCanvasElement, opacity: number): HTMLCanvasElement {
  const ctx = scratchOpacityCanvas.getContext('2d')!;
  scratchOpacityCanvas.width = canvas.width;
  scratchOpacityCanvas.height = canvas.height;
  ctx.globalAlpha = opacity;
  ctx.drawImage(canvas, 0, 0);
  return scratchOpacityCanvas;
}

export function getAbsoluteUrl(url: string): string {
  const a = document.createElement('a');
  a.href = encodeURI(url);
  return decodeURI(a.href);
}

/**
 * Return the WMTS URL to use in the print spec.
 */
export function getWmtsUrl(source: WMTS): string {
  const urls = source.getUrls()!;
  console.assert(urls.length > 0);
  return getAbsoluteUrl(urls[0]);
}

export async function getStatus(mfpBaseUrl: string, ref: string): Promise<MFPStatusResponse> {
  const response = await fetch(`${mfpBaseUrl}/status/${ref}.json`);
  return await response.json();
}

export async function cancelPrint(mfpBaseUrl: string, ref: string): Promise<MFPCancelResponse> {
  const response = await fetch(`${mfpBaseUrl}/cancel/${ref}`, {method: 'DELETE'});
  return {status: response.status};
}

export async function requestReport(mfpBaseUrl: string, spec: MFPSpec): Promise<MFPReportResponse> {
  const report = await fetch(`${mfpBaseUrl}/report.${spec.format}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(spec),
  });
  return await report.json();
}

/**
 * @param requestReport the name of the requested report
 * @param response The initial print response.
 * @param interval (s) the internal to poll the download url.
 * @param timeout (s) A timeout for this operation.
 * @returns a Promise with the download url once the document is printed or an error.
 */
export async function getDownloadUrl(
  requestReport: string,
  response: MFPReportResponse,
  interval = 1000,
  timeout = 30000,
): Promise<string> {
  let totalDuration = 0 - interval;
  return new Promise((resolve, reject) => {
    const intervalId = setInterval(async () => {
      let status: MFPStatusResponse | undefined;
      try {
        status = await getStatus(requestReport, response.ref);
        if (status.error) {
          throw new Error(status.error);
        }
      } catch (error) {
        reject(error);
      }
      if (status.done) {
        clearInterval(intervalId);
        resolve(`${requestReport}/report/${response.ref}`);
      }
      totalDuration += interval;
      if (totalDuration >= timeout) {
        clearInterval(intervalId);
        reject(new Error('Print duration exceeded'));
      }
    }, interval);
  });
}
