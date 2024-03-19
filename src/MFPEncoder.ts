import {getWmtsMatrices, asOpacity, getWmtsUrl} from './utils';
import {drawFeaturesToContext, createCoordinateToPixelTransform} from './mvtUtils';

import TileLayer from 'ol/layer/Tile.js';
import WMTSSource from 'ol/source/WMTS.js';
import TileWMSSource from 'ol/source/TileWMS.js';
import OSMSource from 'ol/source/OSM.js';

import {getWidth as getExtentWidth, getHeight as getExtentHeight} from 'ol/extent.js';

import BaseCustomizer from './BaseCustomizer';
import type Map from 'ol/Map.js';
import type {MFPImageLayer, MFPLayer, MFPMap, MFPOSMLayer, MFPWmtsLayer, MFPWmsLayer} from './types';
import type WMTS from 'ol/source/WMTS.js';
import type {Geometry} from 'ol/geom.js';
import type {State} from 'ol/layer/Layer.js';
import ImageLayer from 'ol/layer/Image.js';
import ImageWMSSource from 'ol/source/ImageWMS.js';
import {toDegrees} from 'ol/math.js';
import VectorTileLayer from 'ol/layer/VectorTile.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorEncoder from './VectorEncoder';
import {toContext} from 'ol/render.js';
import VectorSource from 'ol/source/Vector.js';
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
  private scratchCanvas: HTMLCanvasElement = document.createElement('canvas');

  /**
   *
   * @param printUrl The base URL to a mapfish print server / proxy
   */
  constructor(printUrl: string) {
    this.url = printUrl;
  }

  /**
   *
   * @param options
   * @return the map portion of a Mapfish print spec
   */
  async encodeMap(options: EncodeMapOptions): Promise<MFPMap> {
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
  async encodeLayerGroup(
    layerGroup: LayerGroup,
    printResolution: number,
    customizer: BaseCustomizer,
  ): Promise<MFPLayer[]> {
    const layerStates = layerGroup
      .getLayerStatesArray()
      .filter(customizer.layerFilter)
      .sort((state, nextState) => (state.zIndex || 0) - (nextState.zIndex || 0))
      .reverse();

    const layers: MFPLayer[] = [];
    for (const layerState of layerStates) {
      const spec = await this.encodeLayerState(layerState, printResolution, customizer);
      if (spec) {
        if (Array.isArray(spec)) {
          layers.push(...spec);
        } else {
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
  async encodeLayerState(
    layerState: State,
    printResolution: number,
    customizer: BaseCustomizer,
  ): Promise<MFPLayer[] | MFPLayer | null> {
    if (
      !layerState.visible ||
      printResolution < layerState.minResolution ||
      printResolution >= layerState.maxResolution
    ) {
      return null;
    }
    const layer = layerState.layer;

    if (layer instanceof ImageLayer) {
      return this.encodeImageLayerState(layerState, customizer);
    }

    if (layer instanceof VectorLayer) {
      const encoded = new VectorEncoder(layerState, customizer).encodeVectorLayer(printResolution)!;
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
  encodeImageLayerState(layerState: State, customizer: BaseCustomizer): MFPWmsLayer | null {
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
  encodeImageWmsLayerState(layerState: State, customizer: BaseCustomizer) {
    const layer = layerState.layer;
    const source = layer.getSource() as ImageWMSSource;
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
  encodeWmsLayerState(layerState: State, url: string, params: any, customizer: BaseCustomizer): MFPWmsLayer {
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
  encodeTileLayerState(
    layerState: State,
    customizer: BaseCustomizer,
  ): MFPOSMLayer | MFPWmtsLayer | MFPWmsLayer | null {
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
  encodeTileWmsLayerState(layerState: State, customizer: BaseCustomizer): MFPWmsLayer {
    const layer = layerState.layer;
    console.assert(layer instanceof TileLayer);
    const source = layer.getSource() as TileWMSSource;
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
  encodeOSMLayerState(layerState: State, customizer: BaseCustomizer): MFPOSMLayer {
    const layer = layerState.layer;
    const source = layer.getSource()! as OSMSource;
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
  encodeTileWmtsLayerState(layerState: State, customizer: BaseCustomizer): MFPWmtsLayer {
    const layer = layerState.layer;
    console.assert(layer instanceof TileLayer);
    const source = layer.getSource()! as WMTS;
    console.assert(source instanceof WMTSSource);

    const dimensionParams = source.getDimensions();
    const dimensions = Object.keys(dimensionParams);

    const wmtsLayer: MFPWmtsLayer = {
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
  async encodeMVTLayerState(
    layerState: State,
    printResolution: number,
    customizer: BaseCustomizer,
  ): Promise<MFPLayer[] | MFPLayer | null> {
    const layer = layerState.layer as VectorTileLayer;
    const {MVTEncoder} = await import('@geoblocks/print');
    const encoder = new MVTEncoder();
    const printExtent = customizer.getPrintExtent();
    const width = getExtentWidth(printExtent) / printResolution;
    const height = getExtentHeight(printExtent) / printResolution;
    const canvasSize: [number, number] = [width, height];
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
      .map(
        (result) =>
          Object.assign(
            {
              type: 'image',
              name: layer.get('name'),
              opacity: 1,
              imageFormat: 'image/png',
            },
            result,
          ) as MFPLayer,
      );
  }

  /**
   * Encodes Image layerState.
   * @param layerState
   * @param resolution
   * @param customizer
   * @return a spec file
   */
  async encodeAsImageLayer(
    layerState: State,
    resolution: number,
    customizer: BaseCustomizer,
    additionalDraw: (cir: VectorContext, geometry: Geometry) => void,
  ): Promise<MFPImageLayer> {
    const layer = layerState.layer as VectorLayer<VectorSource>;
    const printExtent = customizer.getPrintExtent();
    const width = getExtentWidth(printExtent) / resolution;
    const height = getExtentHeight(printExtent) / resolution;
    const size: [number, number] = [width, height];
    const vectorContext: VectorContext = toContext(this.scratchCanvas.getContext('2d')!, {
      size,
      pixelRatio: 1,
    });
    const coordinateToPixelTransform = createCoordinateToPixelTransform(printExtent, resolution, size);
    const features = layer.getSource()!.getFeatures();
    const styleFunction = layer.getStyleFunction();

    drawFeaturesToContext(
      features,
      styleFunction,
      resolution,
      coordinateToPixelTransform,
      vectorContext,
      additionalDraw,
    );

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
