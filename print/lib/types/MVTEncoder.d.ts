import RenderFeature from 'ol/render/Feature.js';
import { StyleFunction } from 'ol/style/Style.js';
import VectorTileLayer from 'ol/layer/VectorTile.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import { Extent } from 'ol/extent.js';
import { CoordExtent } from './encodeutils';
import TileGrid from 'ol/tilegrid/TileGrid.js';
/**
 * Simple proxy to the fetch function for now.
 * Can be updated later to limit the number of concurrent requests.
 * Can be made to work on stub for testing.
 */
export declare class PoolDownloader {
    fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
}
export interface PrintEncodeOptions {
    /**
     * The layer to print.
     */
    layer: VectorTileLayer;
    /**
     * The printed extent in OpenLayers coordinates system.
     */
    printExtent: Extent;
    /**
     * The resolution to use for retrieving the PBF files (OpenLayers resolution).
     * This will directly impact the quantity of details.
     */
    tileResolution: number;
    /**
     * The resolution to use for styling the features (OpenLayers resolution).
     * This is the one passed to the style function.
     */
    styleResolution: number;
    /**
     * The virtual size of the canvas to print to. This must have the same ratio has the print extent.
     * This is in real pixels.
     */
    canvasSize: [number, number];
    /**
     * PNG or JPEG
     */
    outputFormat?: string;
}
interface PrintResult {
    extent: Extent;
    baseURL: string;
}
interface _FeatureExtent {
    features: RenderFeature[];
    extent: Extent;
    url: string;
}
/**
 * Encode an OpenLayers MVT layer to a list of canvases.
 */
export default class MVTEncoder {
    static useImmediateAPI: boolean;
    /**
     * @param featuresExtent A list of features to render (in world coordinates)
     * @param styleFunction The style function for the features
     * @param styleResolution The resolution used in the style function
     * @param coordinateToPixelTransform World to CSS coordinates transform (top-left is 0)
     * @param context
     * @param renderBuffer
     * @param declutter
     */
    private drawFeaturesToContextUsingRenderAPI_;
    /**
     *
     * @param features A list of features to render (in world coordinates)
     * @param styleFunction The style function for the features
     * @param styleResolution The resolution used in the style function
     * @param coordinateToPixelTransform World to CSS coordinates transform (top-left is 0)
     * @param vectorContext
     */
    private drawFeaturesToContextUsingImmediateAPI_;
    snapTileResolution(tileGrid: TileGrid, targetResolution: number): number;
    assertCanvasSize(printExtent: any, canvasSize: any): void;
    allFullfilled<MyType>(promises: Promise<MyType>[]): Promise<MyType[]>;
    fetchFeatures(mvtTiles: CoordExtent[], source: VectorTileSource): Promise<_FeatureExtent[]>;
    /**
     * @param options
     */
    encodeMVTLayer(options: PrintEncodeOptions): Promise<PrintResult[]>;
    renderTile(featuresExtents: _FeatureExtent[], rtExtent: Extent, canvasSize: [number, number], styleResolution: number, layerStyleFunction: StyleFunction, layerOpacity: number, renderBuffer: number, declutter: boolean, outputFormat?: string): PrintResult;
}
export {};
