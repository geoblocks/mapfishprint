import type { Geometry } from 'ol/geom.js';
import type { State } from 'ol/layer/Layer.js';
import type { WMTS } from 'ol/source.js';
import type { Image, Stroke } from 'ol/style.js';
import type { MFPSymbolizerLine, MFPSymbolizerPoint, MFPWmtsLayer } from './types';
import type { Feature as GeoJSONFeature } from 'geojson';
/**
 * The customizer allows to customize some transformations.
 * It also defines the print extent.
 */
export default class BaseCustomizer {
    readonly printExtent: number[];
    /**
     *
     * @param printExtent The extent to print (useful for MVT / static image layers)
     */
    constructor(printExtent: number[]);
    /**
     *
     * @param layerState
     * @return true to convert this layer, false to skip it
     */
    layerFilter(layerState: State): boolean;
    /**
     * Decide to skip some geometries.
     * Useful to avoid sending features outside the print extend on the wire.
     * @param geometry
     * @return true to convert this feature, false to skip it
     */
    geometryFilter(geometry: Geometry): boolean;
    /**
     * Can be used to add / remove properties to features
     * @param layerState
     * @param feature converted feature
     */
    feature(layerState: State, feature: GeoJSONFeature): void;
    /**
     * Can be used to manipulate the line symbolizers
     * @param layerState
     * @param symbolizer
     * @param stroke
     */
    line(layerState: State, symbolizer: MFPSymbolizerLine, stroke: Stroke): void;
    /**
     * Can be used to manipulate the image symbolizers
     * @param layerState
     * @param symbolizer
     * @param image
     */
    point(layerState: State, symbolizer: MFPSymbolizerPoint, image: Image): void;
    /**
     * Can be used to manipulate a converted WMTS layer
     * @param layerState
     * @param wmtsLayer
     * @param source
     */
    wmtsLayer(layerState: State, wmtsLayer: MFPWmtsLayer, source: WMTS): void;
}
//# sourceMappingURL=BaseCustomizer.d.ts.map