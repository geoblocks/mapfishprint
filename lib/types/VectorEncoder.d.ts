import type { Fill, Icon, Image, Stroke, Style, Text } from 'ol/style.js';
import type BaseCustomizer from './BaseCustomizer';
import type { MapFishPrintSymbolizer, MapFishPrintSymbolizerLine, MapFishPrintSymbolizerPoint, MapFishPrintSymbolizerPolygon, MapFishPrintSymbolizers, MapFishPrintSymbolizerText, MapFishPrintVectorLayer, MapFishPrintVectorStyle } from './mapfishprintTypes';
import type { State } from 'ol/layer/Layer.js';
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
export default class VectorEncoder {
    private layerState_;
    private layer_;
    private customizer_;
    private geojsonFormat;
    private deepIds_;
    private lastDeepId_;
    constructor(layerState: State, customizer: BaseCustomizer);
    encodeVectorLayer(resolution: number): MapFishPrintVectorLayer | null;
    getDeepStyleUid(style: Style): string;
    addVectorStyle(mapfishStyleObject: MapFishPrintVectorStyle, geojsonFeature: GeoJSON.Feature, geometryType: GeometryType, style: Style): void;
    encodeVectorStyle(geometryType: GeometryType, style: Style): MapFishPrintSymbolizers | null;
    protected encodeVectorStyleFill(symbolizer: MapFishPrintSymbolizerPoint | MapFishPrintSymbolizerPolygon | MapFishPrintSymbolizerText, fillStyle: Fill): void;
    protected encodeVectorStyleLine(symbolizers: MapFishPrintSymbolizer[], strokeStyle: Stroke): void;
    protected encodeVectorStylePoint(symbolizers: MapFishPrintSymbolizer[], imageStyle: Image): void;
    addGraphicOffset_(symbolizer: MapFishPrintSymbolizerPoint, icon: Icon, width: number, height: number): void;
    /**
     * @suppress {accessControls}
     */
    hasDefaultAnchor_(icon: Icon): boolean;
    protected encodeVectorStylePolygon(symbolizers: MapFishPrintSymbolizer[], fillStyle: Fill, strokeStyle: Stroke): void;
    protected encodeVectorStyleStroke(symbolizer: MapFishPrintSymbolizerPoint | MapFishPrintSymbolizerLine | MapFishPrintSymbolizerPolygon, strokeStyle: Stroke): void;
    protected encodeVectorStyleText(symbolizers: MapFishPrintSymbolizer[], textStyle: Text): void;
}
export {};
//# sourceMappingURL=VectorEncoder.d.ts.map