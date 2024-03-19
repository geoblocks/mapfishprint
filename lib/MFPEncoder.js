import { getWmtsMatrices, asOpacity, getWmtsUrl } from "./utils.js";
import { drawFeaturesToContext, createCoordinateToPixelTransform } from "./mvtUtils.js";
import TileLayer from 'ol/layer/Tile.js';
import WMTSSource from 'ol/source/WMTS.js';
import TileWMSSource from 'ol/source/TileWMS.js';
import OSMSource from 'ol/source/OSM.js';
import { getWidth as getExtentWidth, getHeight as getExtentHeight } from 'ol/extent.js';
import ImageLayer from 'ol/layer/Image.js';
import ImageWMSSource from 'ol/source/ImageWMS.js';
import { toDegrees } from 'ol/math.js';
import VectorTileLayer from 'ol/layer/VectorTile.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorEncoder from "./VectorEncoder.js";
import { toContext } from 'ol/render.js';
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
        return {
            center,
            dpi: options.dpi,
            projection,
            rotation,
            scale: options.scale,
            layers,
        };
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
        if (layer instanceof ImageLayer) {
            return this.encodeImageLayerState(layerState, customizer);
        }
        if (layer instanceof VectorLayer) {
            const encoded = new VectorEncoder(layerState, customizer).encodeVectorLayer(printResolution);
            const renderAsSvg = layerState.layer.get('renderAsSvg');
            if (renderAsSvg !== undefined) {
                encoded.renderAsSvg = renderAsSvg;
            }
            return encoded;
        }
        if (layer instanceof TileLayer) {
            return this.encodeTileLayerState(layerState, customizer);
        }
        if (layer instanceof VectorTileLayer) {
            return await this.encodeMVTLayerState(layerState, printResolution, customizer);
        }
        return null;
    }
    /**
     * @returns An Encoded WMS Image layer from an Image Layer (high level method).
     */
    encodeImageLayerState(layerState, customizer) {
        const layer = layerState.layer;
        if (!(layer instanceof ImageLayer)) {
            console.assert(layer instanceof ImageLayer);
        }
        const source = layer.getSource();
        if (source instanceof ImageWMSSource) {
            return this.encodeImageWmsLayerState(layerState, customizer);
        }
        return null;
    }
    /**
     * @returns An Encoded WMS Image layer from an Image WMS Source (high level method).
     */
    encodeImageWmsLayerState(layerState, customizer) {
        const layer = layerState.layer;
        const source = layer.getSource();
        console.assert(layer instanceof ImageWMSSource);
        const url = source.getUrl();
        if (url !== undefined) {
            return this.encodeWmsLayerState(layerState, url, source.getParams(), customizer);
        }
        return null;
    }
    /**
     * @returns An Encoded WMS Image layer from an Image WMS Source.
     */
    encodeWmsLayerState(layerState, url, params, customizer) {
        const layer = layerState.layer;
        return {
            name: layer.get('name'),
            baseURL: url,
            imageFormat: 'image/png',
            layers: [''],
            customParams: {},
            serverType: 'mapserver',
            type: 'wms',
            opacity: layer.getOpacity(),
            version: params.VERSION,
            useNativeAngle: true,
            styles: [''],
        };
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
            return this.encodeTileWmtsLayerState(layerState, customizer);
        }
        if (source instanceof TileWMSSource) {
            return this.encodeTileWmsLayerState(layerState, customizer);
        }
        if (source instanceof OSMSource) {
            return this.encodeOSMLayerState(layerState, customizer);
        }
        return null;
    }
    /**
     * Encodes a tiled WMS layerState as a MFPWmsLayer
     * @param layerState
     * @param customizer
     * @return a spec fragment
     */
    encodeTileWmsLayerState(layerState, customizer) {
        const layer = layerState.layer;
        console.assert(layer instanceof TileLayer);
        const source = layer.getSource();
        console.assert(layer instanceof TileWMSSource);
        const urls = source.getUrls();
        console.assert(!!urls);
        return this.encodeWmsLayerState(layerState, urls[0], source.getParams(), customizer);
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
    encodeTileWmtsLayerState(layerState, customizer) {
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
     * @param layerState An MVT layer state
     * @param printResolution
     * @param customizer
     * @return a spec fragment
     */
    async encodeMVTLayerState(layerState, printResolution, customizer) {
        const layer = layerState.layer;
        const { MVTEncoder } = await import('@geoblocks/print');
        const encoder = new MVTEncoder();
        const printExtent = customizer.getPrintExtent();
        const width = getExtentWidth(printExtent) / printResolution;
        const height = getExtentHeight(printExtent) / printResolution;
        const canvasSize = [width, height];
        const printOptions = {
            layer,
            printExtent: customizer.getPrintExtent(),
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
    /**
     * Encodes Image layerState.
     * @param layerState
     * @param resolution
     * @param customizer
     * @return a spec file
     */
    async encodeAsImageLayer(layerState, resolution, customizer, additionalDraw) {
        const layer = layerState.layer;
        const printExtent = customizer.getPrintExtent();
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
        drawFeaturesToContext(features, styleFunction, resolution, coordinateToPixelTransform, vectorContext, additionalDraw);
        return {
            type: 'image',
            extent: printExtent,
            imageFormat: 'image/png', // this is the target image format in the mapfish-print
            opacity: 1, // FIXME: mapfish-print is not handling the opacity correctly for images with dataurl.
            name: layer.get('name'),
            baseURL: asOpacity(this.scratchCanvas, layer.getOpacity()).toDataURL('PNG'),
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTUZQRW5jb2Rlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9NRlBFbmNvZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxlQUFlLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUMvRCxPQUFPLEVBQUMscUJBQXFCLEVBQUUsZ0NBQWdDLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFFbkYsT0FBTyxTQUFTLE1BQU0sa0JBQWtCLENBQUM7QUFDekMsT0FBTyxVQUFVLE1BQU0sbUJBQW1CLENBQUM7QUFDM0MsT0FBTyxhQUFhLE1BQU0sc0JBQXNCLENBQUM7QUFDakQsT0FBTyxTQUFTLE1BQU0sa0JBQWtCLENBQUM7QUFFekMsT0FBTyxFQUFDLFFBQVEsSUFBSSxjQUFjLEVBQUUsU0FBUyxJQUFJLGVBQWUsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQVF0RixPQUFPLFVBQVUsTUFBTSxtQkFBbUIsQ0FBQztBQUMzQyxPQUFPLGNBQWMsTUFBTSx1QkFBdUIsQ0FBQztBQUNuRCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQ3JDLE9BQU8sZUFBZSxNQUFNLHdCQUF3QixDQUFDO0FBQ3JELE9BQU8sV0FBVyxNQUFNLG9CQUFvQixDQUFDO0FBQzdDLE9BQU8sYUFBYSxNQUFNLGlCQUFpQixDQUFDO0FBQzVDLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFhdkM7O0dBRUc7QUFDSCxNQUFNLENBQUMsT0FBTyxPQUFPLGNBQWM7SUFDeEIsR0FBRyxDQUFTO0lBQ2IsYUFBYSxHQUFzQixRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRTVFOzs7T0FHRztJQUNILFlBQVksUUFBZ0I7UUFDMUIsSUFBSSxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUM7SUFDdEIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsU0FBUyxDQUFDLE9B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