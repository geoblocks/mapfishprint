import TileGrid from 'ol/tilegrid/TileGrid.js';
import { Extent } from 'ol/extent.js';
import { Transform } from 'ol/transform.js';
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
export declare function createWorldToVectorContextTransform(renderExtent: Extent, width: number, height: number): Transform;
export interface CoordExtent {
    coord: import('ol/tilecoord.js').TileCoord;
    extent: import('ol/extent.js').Extent;
}
export declare function listTilesCoveringExtentAtResolution(printExtent: Extent, printResolution: number, tileGrid: TileGrid): CoordExtent[];
