import type { Fill, Icon, Image, Stroke, Style, Text } from 'ol/style.js';
import type BaseCustomizer from './BaseCustomizer';
import type { MFPSymbolizer, MFPSymbolizerLine, MFPSymbolizerPoint, MFPSymbolizerPolygon, MFPSymbolizers, MFPSymbolizerText, MFPVectorLayer, MFPVectorStyle } from './types';
import type { State } from 'ol/layer/Layer.js';
import type { Feature as GeoJSONFeature } from 'geojson';
export declare const PrintStyleType: {
    readonly LINE_STRING: "LineString";
    readonly POINT: "Point";
    readonly POLYGON: "Polygon";
};
type GeometryType = 'LineString' | 'Point' | 'Polygon' | 'MultiLineString' | 'MultiPolygon';
export declare const PrintStyleTypes_: {
    readonly LineString: "LineString";
    readonly Point: "Point";
    readonly Polygon: "Polygon";
    readonly MultiLineString: "LineString";
    readonly MultiPoint: "Point";
    readonly MultiPolygon: "Polygon";
};
/**
 * Convert a given OpenLayers layer to the MapFishPrint v3 format.
 * The conversion can be customized by:
 * - extending the class;
 * - passing a customizer.
 */
export default class VectorEncoder {
    private layerState_;
    private layer_;
    private customizer_;
    private geojsonFormat;
    private deepIds_;
    private lastDeepId_;
    constructor(layerState: State, customizer: BaseCustomizer);
    encodeVectorLayer(resolution: number): MFPVectorLayer | null;
    getDeepStyleUid(style: Style): string;
    addVectorStyle(mapfishStyleObject: MFPVectorStyle, geojsonFeature: GeoJSONFeature, geometryType: GeometryType, style: Style): void;
    encodeVectorStyle(geometryType: GeometryType, style: Style): MFPSymbolizers | null;
    protected encodeVectorStyleFill(symbolizer: MFPSymbolizerPoint | MFPSymbolizerPolygon | MFPSymbolizerText, fillStyle: Fill): void;
    protected encodeVectorStyleLine(symbolizers: MFPSymbolizer[], strokeStyle: Stroke): void;
    protected encodeVectorStylePoint(symbolizers: MFPSymbolizer[], imageStyle: Image): void;
    addGraphicOffset_(symbolizer: MFPSymbolizerPoint, icon: Icon, width: number, height: number): void;
    /**
     * @suppress {accessControls}
     */
    hasDefaultAnchor_(icon: Icon): boolean;
    protected encodeVectorStylePolygon(symbolizers: MFPSymbolizer[], fillStyle: Fill, strokeStyle: Stroke): void;
    protected encodeVectorStyleStroke(symbolizer: MFPSymbolizerPoint | MFPSymbolizerLine | MFPSymbolizerPolygon, strokeStyle: Stroke): void;
    protected encodeVectorStyleText(symbolizers: MFPSymbolizer[], textStyle: Text): void;
}
export {};
//# sourceMappingURL=VectorEncoder.d.ts.map