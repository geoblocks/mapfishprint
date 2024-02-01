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
            matrixSize: [
                tileRange.maxX - tileRange.minX,
                tileRange.maxY - tileRange.minY,
            ],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwZmlzaHByaW50VXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbWFwZmlzaHByaW50VXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxZQUFZLE1BQU0scUJBQXFCLENBQUM7QUFDL0MsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLFlBQVksQ0FBQztBQUlsQyw4R0FBOEc7QUFDOUcsTUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUM7QUFFakM7Ozs7OztHQU1HO0FBQ0gsTUFBTSxVQUFVLGdCQUFnQixDQUFDLEdBQVc7SUFDMUMsT0FBTyxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0FBQzVDLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILE1BQU0sVUFBVSxhQUFhLENBQUMsR0FBYTtJQUN6QyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakIsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pCLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqQixJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDMUQsTUFBTSxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFDRCxNQUFNLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDOUMsTUFBTSxJQUFJLEdBQUcsZ0JBQWdCLENBQUMs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