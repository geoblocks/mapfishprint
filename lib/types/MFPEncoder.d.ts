import BaseCustomizer from './BaseCustomizer';
import type Map from 'ol/Map.js';
import type { MFPImageLayer, MFPLayer, MFPMap, MFPOSMLayer, MFPWmtsLayer, MFPWmsLayer } from './types';
import type { Geometry } from 'ol/geom.js';
import type { State } from 'ol/layer/Layer.js';
import LayerGroup from 'ol/layer/Group';
import VectorContext from 'ol/render/VectorContext';
export interface EncodeMapOptions {
    map: Map;
    scale: number;
    printResolution: number;
    dpi: number;
    customizer: BaseCustomizer;
}
/**
 * Converts OpenLayers map / layers to Mapfish print v3 format.
 */
export default class MFPBaseEncoder {
    readonly url: string;
    private scratchCanvas;
    /**
     *
     * @param printUrl The base URL to a mapfish print server / proxy
     */
    constructor(printUrl: string);
    /**
     *
     * @param options
     * @return the map portion of a Mapfish print spec
     */
    encodeMap(options: EncodeMapOptions): Promise<MFPMap>;
    /**
     *
     * @param layerGroup The top level layer group of a map
     * @param printResolution
     * @param customizer
     * @return a list of Mapfish print layer specs
     */
    encodeLayerGroup(layerGroup: LayerGroup, printResolution: number, customizer: BaseCustomizer): Promise<MFPLayer[]>;
    /**
     * Encodes a given OpenLayers layerState to Mapfish print format.
     * @param layerState
     * @param printResolution
     * @param customizer
     * @return a spec fragment
     */
    encodeLayerState(layerState: State, printResolution: number, customizer: BaseCustomizer): Promise<MFPLayer[] | MFPLayer | null>;
    /**
     * @returns An Encoded WMS Image layer from an Image Layer (high level method).
     */
    encodeImageLayerState(layerState: State, customizer: BaseCustomizer): MFPWmsLayer | null;
    /**
     * @returns An Encoded WMS Image layer from an Image WMS Source (high level method).
     */
    encodeImageWmsLayerState(layerState: State, customizer: BaseCustomizer): MFPWmsLayer;
    /**
     * @returns An Encoded WMS Image layer from an Image WMS Source.
     */
    encodeWmsLayerState(layerState: State, url: string, params: any, customizer: BaseCustomizer): MFPWmsLayer;
    /**
     * Encodes a tile layerState (high level method)
     * @param layerState
     * @param customizer
     * @return a spec fragment
     */
    encodeTileLayerState(layerState: State, customizer: BaseCustomizer): MFPOSMLayer | MFPWmtsLayer | MFPWmsLayer | null;
    /**
     * Encodes a tiled WMS layerState as a MFPWmsLayer
     * @param layerState
     * @param customizer
     * @return a spec fragment
     */
    encodeTileWmsLayerState(layerState: State, customizer: BaseCustomizer): MFPWmsLayer;
    /**
     * Encodes an OSM layerState
     * @param layerState
     * @param customizer
     * @return a spec fragment
     */
    encodeOSMLayerState(layerState: State, customizer: BaseCustomizer): MFPOSMLayer;
    /**
     * Encodes a WMTS layerState
     * @param layerState
     * @param customizer
     * @return a spec fragment
     */
    encodeTileWmtsLayerState(layerState: State, customizer: BaseCustomizer): MFPWmtsLayer;
    /**
     * @param layerState An MVT layer state
     * @param printResolution
     * @param customizer
     * @return a spec fragment
     */
    encodeMVTLayerState(layerState: State, printResolution: number, customizer: BaseCustomizer): Promise<MFPLayer[] | MFPLayer | null>;
    /**
     * Encodes Image layerState.
     * @param layerState
     * @param resolution
     * @param customizer
     * @return a spec file
     */
    encodeAsImageLayer(layerState: State, resolution: number, customizer: BaseCustomizer, additionalDraw: (cir: VectorContext, geometry: Geometry) => void): Promise<MFPImageLayer>;
}
//# sourceMappingURL=MFPEncoder.d.ts.map