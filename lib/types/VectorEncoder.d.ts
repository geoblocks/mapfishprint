import type { Fill, Icon, Image, Stroke, Style, Text } from 'ol/style.js';
import { Circle as olStyleCircle, Icon as olStyleIcon } from 'ol/style.js';
import type BaseCustomizer from './BaseCustomizer';
import type { MFPSymbolizer, MFPSymbolizerLine, MFPSymbolizerPoint, MFPSymbolizerPolygon, MFPSymbolizers, MFPSymbolizerText, MFPVectorLayer, MFPVectorStyle } from './types';
import type { State } from 'ol/layer/Layer.js';
import type { Feature as GeoJSONFeature } from 'geojson';
/** Represents the different types of printing styles. */
export declare const PrintStyleType: {
    readonly LINE_STRING: "LineString";
    readonly POINT: "Point";
    readonly POLYGON: "Polygon";
};
/** Supported geometry types */
type GeometryType = 'LineString' | 'Point' | 'Polygon' | 'MultiLineString' | 'MultiPolygon';
/** Link between supported geometry and print style types. */
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
    /**
     * Encodes the vector layer into a mapfish vector layer object.
     * @returns The encoded vector layer object or null if the layer is empty.
     */
    encodeVectorLayer(resolution: number): MFPVectorLayer | null;
    /**
     * @returns The unique identifier for the given style.
     */
    getDeepStyleUid(style: Style): string;
    /**
     * Adds a vector style to the mapfishStyleObject based on the given parameters.
     */
    addVectorStyle(mapfishStyleObject: MFPVectorStyle, geojsonFeature: GeoJSONFeature, geometryType: GeometryType, style: Style): void;
    /**
     * Encodes the vector style based on the geometry type and style.
     * @returns The encoded vector style, or null if the geometry type is unsupported.
     */
    encodeVectorStyle(geometryType: GeometryType, style: Style): MFPSymbolizers | null;
    /**
     * Encodes the vector style fill for a symbolizer.
     */
    protected encodeVectorStyleFill(symbolizer: MFPSymbolizerPoint | MFPSymbolizerPolygon | MFPSymbolizerText, fillStyle: Fill): void;
    /**
     * Encodes the vector style for a line symbolizer, using the given stroke style.
     */
    protected encodeVectorStyleLine(symbolizers: MFPSymbolizer[], strokeStyle: Stroke): void;
    /**
     * Encodes a vector style point.
     */
    protected encodeVectorStylePoint(symbolizers: MFPSymbolizer[], imageStyle: Image): void;
    /**
     * Encodes the vector style point style circle.
     * @returns The encoded symbolizer point.
     */
    protected encodeVectorStylePointStyleCircle(imageStyle: olStyleCircle): MFPSymbolizerPoint;
    /**
     * Encodes a Vector Style point style icon.
     * @returns The encoded symbolizer point style or undefined if imageStyle src is undefined.
     */
    protected encodeVectorStylePointStyleIcon(imageStyle: olStyleIcon): MFPSymbolizerPoint | undefined;
    /**
     * Add the graphic offset to the symbolizer.
     */
    addGraphicOffset_(symbolizer: MFPSymbolizerPoint, icon: Icon, width: number, height: number): void;
    /**
     * Checks if the provided icon has default anchor properties.
     * @returns true if the icon has default anchor properties, otherwise false.
     */
    hasDefaultAnchor_(icon: Icon): boolean;
    /**
     * Encodes the vector style of a polygon by applying fill and stroke styles.
     */
    protected encodeVectorStylePolygon(symbolizers: MFPSymbolizer[], fillStyle: Fill, strokeStyle: Stroke): void;
    /**
     * Encodes the vector style stroke properties.
     */
    protected encodeVectorStyleStroke(symbolizer: MFPSymbolizerPoint | MFPSymbolizerLine | MFPSymbolizerPolygon, strokeStyle: Stroke): void;
    /**
     * Encodes vector style text.
     */
    protected encodeVectorStyleText(symbolizers: MFPSymbolizer[], textStyle: Text): void;
}
export {};
//# sourceMappingURL=VectorEncoder.d.ts.map