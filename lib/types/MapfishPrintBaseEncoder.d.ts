import type { Transform } from 'ol/transform.js';
import type { Extent } from 'ol/extent.js';
import BaseCustomizer from './BaseCustomizer';
import type Map from 'ol/Map.js';
import type { MapFishPrintLayer, MapFishPrintMap, MapFishPrintOSMLayer, MapFishPrintReportResponse, MapFishPrintSpec, MapFishPrintStatusResponse, MapFishPrintWmtsLayer } from './mapfishprintTypes';
import type { Feature } from 'ol';
import type { StyleFunction } from 'ol/style/Style.js';
import type VectorContext from 'ol/render/VectorContext.js';
import type { Geometry } from 'ol/geom.js';
import type { State } from 'ol/layer/Layer.js';
interface CreateSpecOptions {
    map: Map;
    scale: number;
    printResolution: number;
    dpi: number;
    layout: string;
    format: 'pdf' | 'jpg' | 'png';
    customAttributes: Record<string, any>;
    customizer: BaseCustomizer;
}
interface EncodeMapOptions {
    map: Map;
    scale: number;
    printResolution: number;
    dpi: number;
    customizer: BaseCustomizer;
}
export default class MapfishPrintBaseEncoder {
    readonly url: string;
    private scratchCanvas;
    /**
     * Provides a function to create app.print.Service objects used to
     * interact with MapFish Print v3 services.
     *
     */
    constructor(printUrl: string);
    createSpec(options: CreateSpecOptions): Promise<MapFishPrintSpec>;
    getStatus(ref: string): Promise<MapFishPrintStatusResponse>;
    requestReport(spec: MapFishPrintSpec): Promise<MapFishPrintReportResponse>;
    getDownloadUrl(response: MapFishPrintReportResponse, interval?: number): Promise<string>;
    mapToLayers(map: Map, printResolution: number, customizer: BaseCustomizer): Promise<MapFishPrintLayer[]>;
    encodeMap(options: EncodeMapOptions): Promise<MapFishPrintMap>;
    encodeLayer(layerState: State, printResolution: number, customizer: BaseCustomizer): Promise<MapFishPrintLayer[] | MapFishPrintLayer | null>;
    encodeTileLayer(layerState: State, customizer: BaseCustomizer): MapFishPrintWmtsLayer | MapFishPrintOSMLayer;
    encodeOSMLayer(layerState: State, customizer: BaseCustomizer): MapFishPrintOSMLayer;
    encodeTileWmtsLayer(layerState: State, customizer: BaseCustomizer): MapFishPrintWmtsLayer;
    drawFeaturesToContext(features: Feature[], styleFunction: StyleFunction | undefined, resolution: number, coordinateToPixelTransform: Transform, vectorContext: VectorContext, additionalDraw: (geometry: Geometry) => void): void;
    createCoordinateToPixelTransform(printExtent: Extent, resolution: number, size: number[]): Transform;
    encodeAsImageLayer(layerState: State, resolution: number, customizer: BaseCustomizer): Promise<{
        type: string;
        extent: number[];
        imageFormat: string;
        opacity: number;
        name: any;
        baseURL: string;
    }>;
}
export {};
//# sourceMappingURL=MapfishPrintBaseEncoder.d.ts.map