import { getWmtsMatrices, asOpacity, getWmtsUrl } from "./utils.js";
import { drawFeaturesToContext, createCoordinateToPixelTransform } from "./mvtUtils.js";
import TileLayer from 'ol/layer/Tile.js';
import WMTSSource from 'ol/source/WMTS.js';
import OSMSource from 'ol/source/OSM.js';
import { getWidth as getExtentWidth, getHeight as getExtentHeight } from 'ol/extent.js';
import { toDegrees } from 'ol/math.js';
import VectorTileLayer from 'ol/layer/VectorTile.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorEncoder from "./VectorEncoder.js";
import { toContext } from 'ol/render.js';
import { MVTEncoder } from '@geoblocks/print';
/**
 * Converts OpenLayers map / layers to Mapfish print v3 format.
 */
export default class MFPBaseEncoder {
    url;
    scratchCanvas = document.createElement('canvas');
    /**
     *
     * @param printUrl The base URL to a mapfish print server / proxy
     */
    constructor(printUrl) {
        this.url = printUrl;
    }
    /**
     * Introspect the map and convert each of its layers to Mapfish print v3 format.
     * @param options
     * @return a top level Mapfish print spec
     */
    async createSpec(options) {
        const mapSpec = await this.encodeMap({
            map: options.map,
            scale: options.scale,
            printResolution: options.printResolution,
            dpi: options.dpi,
            customizer: options.customizer,
        });
        const attributes = {
            map: mapSpec,
            datasource: [],
        };
        Object.assign(attributes, options.customAttributes);
        return {
            attributes,
            format: options.format,
            layout: options.layout,
        };
    }
    /**
     *
     * @param options
     * @return the map portion of a Mapfish print spec
     */
    async encodeMap(options) {
        const view = options.map.getView();
        const center = view.getCenter();
        const projection = view.getProjection().getCode();
        const rotation = toDegrees(view.getRotation());
        const mapLayerGroup = options.map.getLayerGroup();
        const layers = await this.encodeLayerGroup(mapLayerGroup, options.printResolution, options.customizer);
        const spec = {
            center,
            dpi: options.dpi,
            pdfA: false,
            projection,
            rotation,
            scale: options.scale,
            layers,
        };
        return spec;
    }
    /**
     *
     * @param layerGroup The top level layer group of a map
     * @param printResolution
     * @param customizer
     * @return a list of Mapfish print layer specs
     */
    async encodeLayerGroup(layerGroup, printResolution, customizer) {
        const layerStates = layerGroup
            .getLayerStatesArray()
            .filter(customizer.layerFilter)
            .sort((state, nextState) => (state.zIndex || 0) - (nextState.zIndex || 0))
            .reverse();
        const layers = [];
        for (const layerState of layerStates) {
            console.assert(printResolution !== undefined);
            const spec = await this.encodeLayerState(layerState, printResolution, customizer);
            if (spec) {
                if (Array.isArray(spec)) {
                    layers.push(...spec);
                }
                else {
                    layers.push(spec);
                }
            }
        }
        return layers;
    }
    /**
     * Encodes a given OpenLayers layerState to Mapfish print format.
     * @param layerState
     * @param printResolution
     * @param customizer
     * @return a spec fragment
     */
    async encodeLayerState(layerState, printResolution, customizer) {
        if (!layerState.visible ||
            printResolution < layerState.minResolution ||
            printResolution >= layerState.maxResolution) {
            return null;
        }
        const layer = layerState.layer;
        if (layer instanceof VectorTileLayer) {
            const encoder = new MVTEncoder();
            const printExtent = customizer.printExtent;
            const width = getExtentWidth(printExtent) / printResolution;
            const height = getExtentHeight(printExtent) / printResolution;
            const canvasSize = [width, height];
            const printOptions = {
                layer,
                printExtent: customizer.printExtent,
                tileResolution: printResolution,
                styleResolution: printResolution,
                canvasSize: canvasSize,
            };
            const results = await encoder.encodeMVTLayer(printOptions);
            return results
                .filter((resut) => resut.baseURL.length > 6)
                .map((result) => Object.assign({
                type: 'image',
                name: layer.get('name'),
                opacity: 1,
                imageFormat: 'image/png',
            }, result));
        }
        if (layer instanceof TileLayer) {
            return this.encodeTileLayerState(layerState, customizer);
        }
        else if (layer instanceof VectorLayer) {
            const encoded = new VectorEncoder(layerState, customizer).encodeVectorLayer(printResolution);
            const renderAsSvg = layer.get('renderAsSvg');
            if (renderAsSvg !== undefined) {
                encoded.renderAsSvg = renderAsSvg;
            }
            return encoded;
        }
        else {
            return null;
        }
    }
    /**
     * Encodes a tile layerState (high level method)
     * @param layerState
     * @param customizer
     * @return a spec fragment
     */
    encodeTileLayerState(layerState, customizer) {
        const layer = layerState.layer;
        console.assert(layer instanceof TileLayer);
        const source = layer.getSource();
        if (source instanceof WMTSSource) {
            return this.encodeTileWmtsLayer(layerState, customizer);
        }
        else if (source instanceof OSMSource) {
            return this.encodeOSMLayerState(layerState, customizer);
        }
        else {
            return null;
        }
    }
    /**
     * Encodes an OSM layerState
     * @param layerState
     * @param customizer
     * @return a spec fragment
     */
    encodeOSMLayerState(layerState, customizer) {
        const layer = layerState.layer;
        const source = layer.getSource();
        return {
            type: 'osm',
            baseURL: source.getUrls()[0],
            opacity: layerState.opacity,
            name: layer.get('name'),
        };
    }
    /**
     * Encodes a WMTS layerState
     * @param layerState
     * @param customizer
     * @return a spec fragment
     */
    encodeTileWmtsLayer(layerState, customizer) {
        const layer = layerState.layer;
        console.assert(layer instanceof TileLayer);
        const source = layer.getSource();
        console.assert(source instanceof WMTSSource);
        const dimensionParams = source.getDimensions();
        const dimensions = Object.keys(dimensionParams);
        const wmtsLayer = {
            type: 'wmts',
            baseURL: getWmtsUrl(source),
            dimensions,
            dimensionParams,
            imageFormat: source.getFormat(),
            name: layer.get('name'),
            layer: source.getLayer(),
            matrices: getWmtsMatrices(source),
            matrixSet: source.getMatrixSet(),
            opacity: layerState.opacity,
            requestEncoding: source.getRequestEncoding(),
            style: source.getStyle(),
            version: source.getVersion(),
        };
        customizer.wmtsLayer(layerState, wmtsLayer, source);
        return wmtsLayer;
    }
    /**
     * Encodes Image layerState.
     * @param layerState
     * @param resolution
     * @param customizer
     * @return a spec file
     */
    async encodeAsImageLayer(layerState, resolution, customizer) {
        const layer = layerState.layer;
        const printExtent = customizer.printExtent;
        const width = getExtentWidth(printExtent) / resolution;
        const height = getExtentHeight(printExtent) / resolution;
        const size = [width, height];
        const vectorContext = toContext(this.scratchCanvas.getContext('2d'), {
            size,
            pixelRatio: 1,
        });
        const coordinateToPixelTransform = createCoordinateToPixelTransform(printExtent, resolution, size);
        const features = layer.getSource().getFeatures();
        const styleFunction = layer.getStyleFunction();
        const additionalDraw = (geometry) => { };
        drawFeaturesToContext(features, styleFunction, resolution, coordinateToPixelTransform, vectorContext, additionalDraw);
        const spec = {
            type: 'image',
            extent: printExtent,
            imageFormat: 'image/png', // this is the target image format in the mapfish-print
            opacity: 1, // FIXME: mapfish-print is not handling the opacity correctly for images with dataurl.
            name: layer.get('name'),
            baseURL: asOpacity(this.scratchCanvas, layer.getOpacity()).toDataURL('PNG'),
        };
        return spec;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTUZQRW5jb2Rlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9NRlBFbmNvZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxlQUFlLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUMvRCxPQUFPLEVBQUMscUJBQXFCLEVBQUUsZ0NBQWdDLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFFbkYsT0FBTyxTQUFTLE1BQU0sa0JBQWtCLENBQUM7QUFDekMsT0FBTyxVQUFVLE1BQU0sbUJBQW1CLENBQUM7QUFDM0MsT0FBTyxTQUFTLE1BQU0sa0JBQWtCLENBQUM7QUFFekMsT0FBTyxFQUFDLFFBQVEsSUFBSSxjQUFjLEVBQUUsU0FBUyxJQUFJLGVBQWUsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQWlCdEYsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUNyQyxPQUFPLGVBQWUsTUFBTSx3QkFBd0IsQ0FBQztBQUNyRCxPQUFPLFdBQVcsTUFBTSxvQkFBb0IsQ0FBQztBQUM3QyxPQUFPLGFBQWEsTUFBTSxpQkFBaUIsQ0FBQztBQUM1QyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBRXZDLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQXNCNUM7O0dBRUc7QUFDSCxNQUFNLENBQUMsT0FBTyxPQUFPLGNBQWM7SUFDeEIsR0FBRyxDQUFTO0lBQ2IsYUFBYSxHQUFzQixRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRTVFOzs7T0FHRztJQUNILFlBQVksUUFBZ0I7UUFDMUIsSUFBSSxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUM7SUFDdEIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQTBCO1FBQ3pDLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUNu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