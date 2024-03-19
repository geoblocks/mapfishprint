var scratchOpacityCanvas;
/**
 *
 * @param inCanvas input canvas
 * @param opacity input opacity
 * @return same or new canvas drawn with given opacity
 */
export function asOpacity(inCanvas, opacity) {
    if (opacity === 1) {
        return inCanvas;
    }
    if (!scratchOpacityCanvas) {
        scratchOpacityCanvas = document.createElement('canvas');
    }
    var outCanvas = scratchOpacityCanvas;
    outCanvas.width = inCanvas.width;
    outCanvas.height = inCanvas.height;
    var outCtx = outCanvas.getContext('2d');
    outCtx.globalAlpha = opacity;
    outCtx.drawImage(inCanvas, 0, 0);
    return outCanvas;
}
/**
 * When the printed area is defined in cms on paper, this function can be used
 * to compute the size of the pixel-perfect image, in dots/pixels.
 * @param dimensions the dimensions of the printed area, on the paper, in cm
 * @param dpi the resolution of the printer
 * @return the dimensions of the canvas, in pixels
 */
export function canvasSizeFromDimensionsInCm(dimensions, dpi) {
    // cm -> inch: / 2.54 // this is a convention
    // inch -> dots: nbInches * dpi
    return dimensions.map(function (cm) { return (cm * dpi) / 2.54; });
}
/**
 * When the printed area is defined in pdf points, this function can be used
 * to compute the size of the pixel-perfect image, in dots/pixels.
 * @param dimensions the dimensions of the printed area, on the pdf, in pdf points
 * @param dpi the resolution of the printer
 * @return the dimensions of the canvas, in pixels
 */
export function canvasSizeFromDimensionsInPdfPoints(dimensions, dpi) {
    // pdf-points -> inch: / 72 // this is a convention
    // inch -> dots: nbInches * dpi
    return dimensions.map(function (pdfPoints) { return (pdfPoints * dpi) / 72; });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FudmFzVXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvY2FudmFzVXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSSxvQkFBdUMsQ0FBQztBQUU1Qzs7Ozs7R0FLRztBQUNILE1BQU0sVUFBVSxTQUFTLENBQ3ZCLFFBQTJCLEVBQzNCLE9BQWU7SUFFZixJQUFJLE9BQU8sS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUNsQixPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBQ0QsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDMUIsb0JBQW9CLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBQ0QsSUFBTSxTQUFTLEdBQUcsb0JBQW9CLENBQUM7SUFDdkMsU0FBUyxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDO0lBQ2pDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztJQUNuQyxJQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBRSxDQUFDO0lBQzNDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO0lBQzdCLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNqQyxPQUFPLFNBQVMsQ0FBQztBQUNuQixDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsTUFBTSxVQUFVLDRCQUE0QixDQUMxQyxVQUE0QixFQUM1QixHQUFXO0lBRVgsNkNBQTZDO0lBQzdDLCtCQUErQjtJQUMvQixPQUFPLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBQyxFQUFFLElBQUssT0FBQSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFJLEVBQWpCLENBQWlCLENBQXFCLENBQUM7QUFDdkUsQ0FBQztBQUVEOzs7Ozs7R0FNRztBQUNILE1BQU0sVUFBVSxtQ0FBbUMsQ0FDakQsVUFBNEIsRUFDNUIsR0FBVztJQUVYLG1EQUFtRDtJQUNuRCwrQkFBK0I7SUFDL0IsT0FBTyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQUMsU0FBUyxJQUFLLE9BQUEsQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUF0QixDQUFzQixDQUcxRCxDQUFDO0FBQ0osQ0FBQyJ9