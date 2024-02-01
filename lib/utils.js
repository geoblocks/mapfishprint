import WMTSTileGrid from 'ol/tilegrid/WMTS.js';
import { toSize } from 'ol/size.js';
// "Standardized rendering pixel size" is defined as 0.28 mm, see http://www.opengeospatial.org/standards/wmts
const WMTS_PIXEL_SIZE_ = 0.28e-3;
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
            scaleDenominator: resolutionMeters / WMTS_PIXEL_SIZE_,
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
    return await (await fetch(`${mfpBaseUrl}/status/${ref}.json`)).json();
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
// FIXME: add timeout
// FIXME: handle errors
export async function getDownloadUrl(requestReport, response, interval = 1000) {
    return new Promise((resolve, reject) => {
        const intervalId = setInterval(async () => {
            const status = await getStatus(requestReport, response.ref);
            if (status.done) {
                clearInterval(intervalId);
                resolve(`${requestReport}/report/${response.ref}`);
            }
        }, interval);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxZQUFZLE1BQU0scUJBQXFCLENBQUM7QUFDL0MsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLFlBQVksQ0FBQztBQUlsQyw4R0FBOEc7QUFDOUcsTUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUM7QUFFakM7Ozs7OztHQU1HO0FBQ0gsTUFBTSxVQUFVLGdCQUFnQixDQUFDLEdBQVc7SUFDMUMsT0FBTyxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0FBQzVDLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILE1BQU0sVUFBVSxhQUFhLENBQUMsR0FBYTtJQUN6QyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakIsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pCLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqQixJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDMUQsTUFBTSxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFDRCxNQUFNLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDOUMsTUFBTSxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFF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