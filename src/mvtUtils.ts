import type {Extent} from 'ol/extent.js';
import {Transform} from 'ol/transform.js';
import {create as createTransform, compose as composeTransform} from 'ol/transform.js';
import {getCenter as getExtentCenter} from 'ol/extent.js';

import type {Feature} from 'ol';
import type {StyleFunction} from 'ol/style/Style.js';
import type VectorContext from 'ol/render/VectorContext.js';

import {transform2D} from 'ol/geom/flat/transform.js';

import type {Geometry} from 'ol/geom.js';

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
export function drawFeaturesToContext(
  features: Feature[],
  styleFunction: StyleFunction | undefined,
  resolution: number,
  coordinateToPixelTransform: Transform,
  vectorContext: VectorContext,
  additionalDraw: (cir: VectorContext, geometry: Geometry) => void,
): void {
  if (!styleFunction) {
    return;
  }
  features.forEach((f) => {
    const optGeometry = f.getGeometry();
    if (!optGeometry) {
      return;
    }
    const geometry = optGeometry.clone();
    geometry.applyTransform((flatCoordinates, dest, stride) => {
      return transform2D(
        flatCoordinates,
        0,
        flatCoordinates.length,
        stride || 2,
        coordinateToPixelTransform,
        dest,
      );
    });
    const styles = styleFunction(f, resolution);
    if (styles) {
      if (Array.isArray(styles)) {
        styles.forEach((style) => {
          vectorContext.setStyle(style);
          vectorContext.drawGeometry(geometry);
        });
      } else {
        vectorContext.setStyle(styles);
        vectorContext.drawGeometry(geometry);
      }
      if (additionalDraw) additionalDraw(vectorContext, geometry);
    }
  });
}

/**
 * A low level utility
 * @param printExtent
 * @param resolution
 * @param size
 * @return the transform
 */
export function createCoordinateToPixelTransform(
  printExtent: Extent,
  resolution: number,
  size: number[],
): Transform {
  const coordinateToPixelTransform = createTransform();
  const center = getExtentCenter(printExtent);
  // See VectorImageLayer
  // this.coordinateToVectorPixelTransform_ = compose(this.coordinateToVectorPixelTransform_,
  composeTransform(
    coordinateToPixelTransform,
    size[0] / 2,
    size[1] / 2,
    1 / resolution,
    -1 / resolution,
    0,
    -center[0],
    -center[1],
  );
  return coordinateToPixelTransform;
}
