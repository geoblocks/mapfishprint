import type { Geometry } from 'ol/geom.js';
import type { State } from 'ol/layer/Layer.js';
import type { WMTS } from 'ol/source.js';
import type { Image, Stroke } from 'ol/style.js';
import type { MapFishPrintSymbolizerLine, MapFishPrintSymbolizerPoint, MapFishPrintWmtsLayer } from './mapfishprintTypes';
export default class BaseCustomizer {
    readonly printExtent: number[];
    constructor(printExtent: number[]);
    layerFilter(layerState: State): boolean;
    geometryFilter(geometry: Geometry): boolean;
    feature(layerState: State, feature: GeoJSON.Feature): void;
    line(layerState: State, symbolizer: MapFishPrintSymbolizerLine, stroke: Stroke): void;
    point(layerState: State, symbolizer: MapFishPrintSymbolizerPoint, image: Image): void;
    wmtsLayer(layerState: State, wmtsLayer: MapFishPrintWmtsLayer, source: WMTS): void;
}
//# sourceMappingURL=BaseCustomizer.d.ts.map