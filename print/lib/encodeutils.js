import { getBottomLeft, getHeight, getWidth } from 'ol/extent.js';
import { create, scale, translate } from 'ol/transform.js';
/**
 * Transform coordinates from world projection to canvas pixels.
 * The print extent is in world projection:
 *   - the bottom left is the point where the coordinates are the smaller;
 *   - when going right, x increases;
 *   - when going up, y increases.
 * The canvas is in pixel coordinates:
 *   - the top left is the point where the coorinates are the smaller;
 *   - whg going right, x increases;
 *   - when going down, y increases.
 * @param renderExtent The extent to render
 * @param width
 * @param height
 * @return the transform
 */
export function createWorldToVectorContextTransform(renderExtent, width, height) {
    var tr = create();
    var originRT = getBottomLeft(renderExtent);
    var eWidth = getWidth(renderExtent);
    var eHeight = getHeight(renderExtent);
    var r1 = eWidth / eHeight;
    var r2 = width / height;
    console.assert(Math.abs(r1 / r2 - 1) < 0.02, "extent and canvas don't have same ratio: ".concat(r1, ", ").concat(r2));
    // mind that transforms are created in reverse order
    // we start with the action to do last: flipping the origin of y (due to CSS coordinate system)
    translate(tr, 0, height);
    // have it scaled so that the rendered extent fit in the target canvas
    scale(tr, width / eWidth, -height / eHeight // we multiply by -1 due to CSS coordinate system
    );
    // have bottom-left be [0,0]
    translate(tr, -originRT[0], -originRT[1]);
    return tr;
}
export function listTilesCoveringExtentAtResolution(printExtent, printResolution, tileGrid) {
    var z = tileGrid.getZForResolution(printResolution, 0.01);
    // const tileResolution = tileGrid.getResolutions()[z];
    var tiles = [];
    tileGrid.forEachTileCoord(printExtent, z, function (coord) {
        var tileExtent = tileGrid.getTileCoordExtent(coord);
        tiles.push({
            coord: coord,
            extent: tileExtent,
        });
    });
    return tiles;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5jb2RldXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZW5jb2RldXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFTLGFBQWEsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQ3hFLE9BQU8sRUFBWSxNQUFNLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBRXBFOzs7Ozs7Ozs7Ozs7OztHQWNHO0FBQ0gsTUFBTSxVQUFVLG1DQUFtQyxDQUNqRCxZQUFvQixFQUNwQixLQUFhLEVBQ2IsTUFBYztJQUVkLElBQU0sRUFBRSxHQUFHLE1BQU0sRUFBRSxDQUFDO0lBQ3BCLElBQU0sUUFBUSxHQUFHLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUM3QyxJQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDdEMsSUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3hDLElBQU0sRUFBRSxHQUFHLE1BQU0sR0FBRyxPQUFPLENBQUM7SUFDNUIsSUFBTSxFQUFFLEdBQUcsS0FBSyxHQUFHLE1BQU0sQ0FBQztJQUMxQixPQUFPLENBQUMsTUFBTSxDQUNaLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQzVCLG1EQUE0QyxFQUFFLGVBQUssRUFBRSxDQUFFLENBQ3hELENBQUM7SUFDRixvREFBb0Q7SUFFcEQsK0ZBQStGO0lBQy9GLFNBQVMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3pCLHNFQUFzRTtJQUN0RSxLQUFLLENBQ0gsRUFBRSxFQUNGLEtBQUssR0FBRyxNQUFNLEVBQ2QsQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLGlEQUFpRDtLQUNwRSxDQUFDO0lBQ0YsNEJBQTRCO0lBQzVCLFNBQVMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQyxPQUFPLEVBQUUsQ0FBQztBQUNaLENBQUM7QUFPRCxNQUFNLFVBQVUsbUNBQW1DLENBQ2pELFdBQW1CLEVBQ25CLGVBQXVCLEVBQ3ZCLFFBQWtCO0lBRWxCLElBQU0sQ0FBQyxHQUFHLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDNUQsdURBQXVEO0lBQ3ZELElBQU0sS0FBSyxHQUFrQixFQUFFLENBQUM7SUFDaEMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsVUFBQyxLQUFLO1FBQzlDLElBQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN0RCxLQUFLLENBQUMsSUFBSSxDQUFDO1lBQ1QsS0FBSyxPQUFBO1lBQ0wsTUFBTSxFQUFFLFVBQVU7U0FDbkIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDSCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUMifQ==