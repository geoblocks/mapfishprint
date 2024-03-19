import type { Extent } from 'ol/extent.js';
import { Transform } from 'ol/transform.js';
import type { Feature } from 'ol';
import type { StyleFunction } from 'ol/style/Style.js';
import type VectorContext from 'ol/render/VectorContext.js';
import type { Geometry } from 'ol/geom.js';
/**
 * A low level utility
 * @param features
 * @param styleFunction
 * @param resolution
 * @param coordinateToPixelTransform
 * @param vectorContext
 * @param additionalDraw
 * @return
 */
export declare function drawFeaturesToContext(features: Feature[], styleFunction: StyleFunction | undefined, resolution: number, coordinateToPixelTransform: Transform, vectorContext: VectorContext, additionalDraw: (cir: VectorContext, geometry: Geometry) => void): void;
/**
 * A low level utility
 * @param printExtent
 * @param resolution
 * @param size
 * @return the transform
 */
export declare function createCoordinateToPixelTransform(printExtent: Extent, resolution: number, size: number[]): Transform;
//# sourceMappingURL=mvtUtils.d.ts.map