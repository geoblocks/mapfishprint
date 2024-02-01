import RenderEvent from 'ol/render/Event';
import { Extent } from 'ol/extent';
/**
 * Center the print extent (in pixels) inside the viewport
 * @param dimensions size in pixels of the print extent
 * @param viewportWidth the width in pixels of the map displayed in the browser
 * @param viewportHeight the height in pixels of the map displayed in the browser
 * @return position of the centered print rectangle
 */
export declare function centerPrintExtent(dimensions: number[], viewportWidth: number, viewportHeight: number): Extent;
export declare function drawPrintExtent(event: RenderEvent, dimensions: number[]): void;
