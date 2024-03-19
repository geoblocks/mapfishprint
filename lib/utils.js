import WMTSTileGrid from 'ol/tilegrid/WMTS.js';
import { toSize } from 'ol/size.js';
import { Constants, CalculatedConstants } from "./constants.js";
/**
 * @param mapPageSize The page size in pixels (width, height)
 * @param center The coordinate of the extent's center.
 * @param scale The scale to calculate the extent width.
 * @returns an extent that fit the page size. Calculated with DPI_PER_DISTANCE_UNIT (by default using meters)
 */
export function getPrintExtent(mapPageSize, center, scale) {
    const [mapPageWidthMeters, mapPageHeightMeters] = mapPageSize.map((side) => ((side / CalculatedConstants.DPI_PER_DISTANCE_UNIT()) * scale) / 2);
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
export function colorZeroPadding(hex) {
    return hex.length === 1 ? `0${hex}` : hex;
}
/**
 * Converts a color from RGB to hex representation.
 *
 * @param rgb rgb representation of the color.
 * @returns hex representation of the color.
 */
export function rgbArrayToHex(rgb) {
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
export function getWmtsMatrices(source) {
    const projection = source.getProjection();
    const tileGrid = source.getTileGrid();
    console.assert(tileGrid instanceof WMTSTileGrid);
    const matrixIds = tileGrid.getMatrixIds();
    const wmtsMatrices = [];
    const metersPerUnit = projection.getMetersPerUnit();
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
        });
    }
    return wmtsMatrices;
}
const scratchOpacityCanvas = document.createElement('canvas');
export function asOpacity(canvas, opacity) {
    const ctx = scratchOpacityCanvas.getContext('2d');
    scratchOpacityCanvas.width = canvas.width;
    scratchOpacityCanvas.height = canvas.height;
    ctx.globalAlpha = opacity;
    ctx.drawImage(canvas, 0, 0);
    return scratchOpacityCanvas;
}
export function getAbsoluteUrl(url) {
    const a = document.createElement('a');
    a.href = encodeURI(url);
    return decodeURI(a.href);
}
/**
 * Return the WMTS URL to use in the print spec.
 */
export function getWmtsUrl(source) {
    const urls = source.getUrls();
    console.assert(urls.length > 0);
    return getAbsoluteUrl(urls[0]);
}
export async function getStatus(mfpBaseUrl, ref) {
    const response = await fetch(`${mfpBaseUrl}/status/${ref}.json`);
    return await response.json();
}
export async function cancelPrint(mfpBaseUrl, ref) {
    const response = await fetch(`${mfpBaseUrl}/cancel/${ref}`, { method: 'DELETE' });
    return { status: response.status };
}
export async function requestReport(mfpBaseUrl, spec) {
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
export async function getDownloadUrl(requestReport, response, interval = 1000, timeout = 30000) {
    let totalDuration = 0 - interval;
    return new Promise((resolve, reject) => {
        const intervalId = setInterval(async () => {
            let status;
            try {
                status = await getStatus(requestReport, response.ref);
                if (status.error) {
                    throw new Error(status.error);
                }
            }
            catch (error) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxZQUFZLE1BQU0scUJBQXFCLENBQUM7QUFDL0MsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLFlBQVksQ0FBQztBQUlsQyxPQUFPLEVBQUMsU0FBUyxFQUFFLG1CQUFtQixFQUFDLE1BQU0sYUFBYSxDQUFDO0FBRTNEOzs7OztHQUtHO0FBQ0gsTUFBTSxVQUFVLGNBQWMsQ0FBQyxXQUFxQixFQUFFLE1BQWdCLEVBQUUsS0FBYTtJQUNuRixNQUFNLENBQUMsa0JBQWtCLEVBQUUsbUJBQW1CLENBQUMsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUMvRCxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxtQkFBbUIsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUM3RSxDQUFDO0lBQ0YsT0FBTztRQUNMLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxrQkFBa0I7UUFDOUIsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLG1CQUFtQjtRQUMvQixNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsa0JBQWtCO1FBQzlCLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxtQkFBbUI7S0FDaEMsQ0FBQztBQUNKLENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxNQUFNLFVBQVUsZ0JBQWdCLENBQUMsR0FBVztJQUMxQyxPQUFPLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7QUFDNUMsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsTUFBTSxVQUFVLGFBQWEsQ0FBQyxHQUFhO0lBQ3pDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqQixNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakIsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pCLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUMxRCxNQUFNLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUM7SUFDakUsQ0FBQztJQUNELE1BQU0sSUFBSSxHQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM5QyxNQUFNLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDOUMsTUFBTSxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzlDLE9BQU8sSUFBSSxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksRUFBRSxDQUFDO0FBQ2xDLENBQUM7QUFFRCxNQUFNLFVBQVUsZUFBZSxDQUFDLE1BQVk7SUFDMUMsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRyxDQUFDO0lBQzNDLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQWtCLENBQUM7SUFDdEQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLFlBQVksWUFBWSxDQUFDLENBQUM7SUFFakQsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQzFDLE1BQU0sWUFBWSxHQUFvQixFQUFFLENBQUM7SUFDekMsTUFBTSxhQUFhLEdBQUcsVUFBVSxDQUFDLGdCQUFnQixFQUFHLENBQUM7SUFDckQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7SUFFaEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUMxQyxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0MsTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxHQUFHLGFBQWEsQ0FBQztRQUNuRSxZQUFZLENBQUMsSUFBSSxDQUFDO1lBQ2hCLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLGdCQUFnQixFQUFFLGdCQUFnQixHQUFHLFNBQVMsQ0FBQyxlQUFlO1lBQzlELFFBQVEsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QyxhQUFhLEVBQUUsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDcEMsVUFBVSxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQztTQUM5RCxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQUVELE9BQU8sWUFBWSxDQUFDO0FBQ3RCLENBQUM7QUFFRCxNQUFNLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDOUQsTUFBTSxVQUFVLFNBQVMsQ0FBQyxNQUF5QixFQUFFLE9BQWU7SUFDbEUsTUFBTSxHQUFHLEdBQUcsb0JBQW9CLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBRSxDQUFDO0lBQ25ELG9CQUFvQixDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQzFDLG9CQUFvQixDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQzVDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO0lBQzFCLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM1QixPQUFPLG9CQUFvQixDQUFDO0FBQzlCLENBQUM7QUFFRCxNQUFNLFVBQVUsY0FBYyxDQUFDLEdBQVc7SUFDeEMsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN0QyxDQUFDLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN4QixPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0IsQ0FBQztBQUVEOztHQUVHO0FBQ0gsTUFBTSxVQUFVLFVBQVUsQ0FBQyxNQUFZO0lBQ3JDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUcsQ0FBQztJQUMvQixPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDaEMsT0FBTyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakMsQ0FBQztBQUVELE1BQU0sQ0FBQyxLQUFLLFVBQVUsU0FBUyxDQUFDLFVBQWtCLEVBQUUsR0FBVztJQUM3RCxNQUFNLFFBQVEsR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLFVBQVUsV0FBVyxHQUFHLE9BQU8sQ0FBQyxDQUFDO0lBQ2pFLE9BQU8sTUFBTSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDL0IsQ0FBQztBQUVELE1BQU0sQ0FBQyxLQUFLLFVBQVUsV0FBVyxDQUFDLFVBQWtCLEVBQUUsR0FBVztJQUMvRCxNQUFNLFFBQVEsR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLFVBQVUsV0FBVyxHQUFHLEVBQUUsRUFBRSxFQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO0lBQ2hGLE9BQU8sRUFBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLE1BQU0sRUFBQyxDQUFDO0FBQ25DLENBQUM7QUFFRCxNQUFNLENBQUMsS0FBSyxVQUFVLGFBQWEsQ0FBQyxVQUFrQixFQUFFLElBQWE7SUFDbkUsTUFBTSxNQUFNLEdBQUcsTUFBTSxLQUFLLENBQUMsR0FBRyxVQUFVLFdBQVcsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFO1FBQ2hFLE1BQU0sRUFBRSxNQUFNO1FBQ2QsT0FBTyxFQUFFO1lBQ1AsY0FBYyxFQUFFLGtCQUFrQjtTQUNuQztRQUNELElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztLQUMzQixDQUFDLENBQUM7SUFDSCxPQUFPLE1BQU0sTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQzdCLENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxNQUFNLENBQUMsS0FBSyxVQUFVLGNBQWMsQ0FDbEMsYUFBcUIsRUFDckIsUUFBMkIsRUFDM0IsUUFBUSxHQUFHLElBQUksRUFDZixPQUFPLEdBQUcsS0FBSztJQUVmLElBQUksYUFBYSxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUM7SUFDakMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNyQyxNQUFNLFVBQVUsR0FBRyxXQUFXLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDeEMsSUFBSSxNQUFxQyxDQUFDO1lBQzFDLElBQUksQ0FBQztnQkFDSCxNQUFNLEdBQUcsTUFBTSxTQUFTLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDdEQsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ2pCLE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNoQyxDQUFDO1lBQ0gsQ0FBQztZQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7Z0JBQ2YsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2hCLENBQUM7WUFDRCxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDaEIsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUMxQixPQUFPLENBQUMsR0FBRyxhQUFhLFdBQVcsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDckQsQ0FBQztZQUNELGFBQWEsSUFBSSxRQUFRLENBQUM7WUFDMUIsSUFBSSxhQUFhLElBQUksT0FBTyxFQUFFLENBQUM7Z0JBQzdCLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDMUIsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQztZQUMvQyxDQUFDO1FBQ0gsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ2YsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDIn0=