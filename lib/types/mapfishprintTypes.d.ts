import type { RequestEncoding } from 'ol/source/WMTS.js';
export interface MapFishPrintLayer {
    renderAsSvg?: boolean;
    failOnError?: boolean;
    type: string;
    opacity: number;
    name: string;
}
export interface MapFishPrintSymbolizer {
    type: string;
}
interface StrokeStyle {
    strokeColor: string;
    strokeOpacity: number;
    strokeWidth: number;
    strokeDashstyle: string;
    strokeLinecap: string;
    strokeLinejoin: string;
}
interface FillStyle {
    fillColor: string;
    fillOpacity: number;
}
export interface MapFishPrintSymbolizerPoint extends MapFishPrintSymbolizer, StrokeStyle, FillStyle {
    type: 'point';
    pointRadius: number;
    externalGraphic: string;
    graphicOpacity: number;
    graphicWidth: number;
    graphicXOffset: number;
    graphicYOffset: number;
    rotation: number;
}
export interface MapFishPrintSymbolizerLine extends MapFishPrintSymbolizer, StrokeStyle {
    type: 'line';
}
export interface MapFishPrintSymbolizerPolygon extends MapFishPrintSymbolizer, StrokeStyle, FillStyle {
    type: 'polygon';
}
export interface MapFishPrintSymbolizerText extends MapFishPrintSymbolizer, FillStyle {
    type: 'text';
    fontColor: string;
    fontFamily: string;
    fontSize: number;
    fontStyle: string;
    fontWeight: string;
    haloColor: string;
    haloOpacity: number;
    haloRadius: number;
    label: string;
    labelAlign: string;
    labelRotation: number;
    labelXOffset: number;
    labelYOffset: number;
}
export interface MapFishPrintSymbolizers {
    symbolizers: MapFishPrintSymbolizer[];
}
export type MapFishPrintVectorStyle = MapFishPrintSymbolizers | Record<string, number>;
export interface MapFishPrintVectorLayer extends MapFishPrintLayer {
    type: 'geojson';
    geoJson: GeoJSON.Feature | GeoJSON.FeatureCollection | string;
    style: MapFishPrintVectorStyle;
}
export interface MapFishPrintWmtsMatrix {
    identifier: string;
    scaleDenominator: number;
    tileSize: number[];
    topLeftCorner: number[];
    matrixSize: number[];
}
export interface MapFishPrintWmtsLayer extends MapFishPrintLayer {
    type: 'wmts';
    baseURL: string;
    dimensions: string[];
    dimensionParams: Record<string, string>;
    imageFormat: string;
    layer: string;
    matrices: MapFishPrintWmtsMatrix[];
    matrixSet: string;
    requestEncoding: RequestEncoding;
    style: string;
    version: string;
}
export interface MapFishPrintOSMLayer extends MapFishPrintLayer {
    type: 'osm';
    baseURL: string;
}
export interface MapFishPrintMap {
    box?: number[];
    center: number[];
    scale: number;
    dpi: number;
    layers: MapFishPrintLayer[];
    projection: string;
    rotation: number;
    useNearestScale?: boolean;
}
export interface MapFishPrintAttributes {
    map: MapFishPrintMap;
    datasource: any[];
}
export interface MapFishPrintSpec {
    attributes: MapFishPrintAttributes;
    layout: string;
    format: string;
    smtp?: Record<string, string>;
}
export interface MapFishPrintReportResponse {
    ref: string;
    statusURL: string;
    downloadURL: string;
}
export interface MapFishPrintStatusResponse {
    done: boolean;
    downloadURL: string;
    elapsedTime: number;
    status: string;
    waitingTime: number;
}
export {};
//# sourceMappingURL=mapfishprintTypes.d.ts.map