import BaseCustomizer from './BaseCustomizer';
import type Map from 'ol/Map.js';
import type { MFPImageLayer, MFPLayer, MFPMap, MFPOSMLayer, MFPSpec, MFPWmtsLayer } from './types';
import type { State } from 'ol/layer/Layer.js';
import LayerGroup from 'ol/layer/Group';
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
     * Introspect the map and convert each of its layers to Mapfish print v3 format.
     * @param options
     * @return a top level Mapfish print spec
     */
    createSpec(options: CreateSpecOptions): Promise<MFPSpec>;
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
     * Encodes a tile layerState (high level method)
     * @param layerState
     * @param customizer
     * @return a spec fragment
     */
    encodeTileLayerState(layerState: State, customizer: BaseCustomizer): MFPOSMLayer | MFPWmtsLayer;
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
    encodeTileWmtsLayer(layerState: State, customizer: BaseCustomizer): MFPWmtsLayer;
    /**
     * Encodes Image layerState.
     * @param layerState
     * @param resolution
     * @param customizer
     * @return a spec file
     */
    encodeAsImageLayer(layerState: State, resolution: number, customizer: BaseCustomizer): Promise<MFPImageLayer>;
}
export {};
//# sourceMappingURL=MFPEncoder.d.ts.map