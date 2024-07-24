import type {Geometry} from 'ol/geom.js';
import type {State} from 'ol/layer/Layer.js';
import type {WMTS, TileWMS} from 'ol/source.js';
import type {Image, Stroke, Text} from 'ol/style.js';
import type {
  MFPWmsLayer,
  MFPSymbolizerLine,
  MFPSymbolizerPoint,
  MFPWmtsLayer,
  MFPSymbolizerText,
} from './types';
import type {Feature as GeoJSONFeature} from 'geojson';

/**
 * The customizer allows to customize some transformations.
 * It also defines the print extent.
 */
export default class BaseCustomizer {
  private printExtent: number[];

  constructor(printExtent?: number[]) {
    this.setPrintExtent(printExtent || [0, 0, Infinity, Infinity]);
  }

  getPrintExtent(): number[] {
    return this.printExtent;
  }

  setPrintExtent(printExtent: number[]) {
    this.printExtent = printExtent;
  }

  /**
   *
   * @param layerState
   * @return true to convert this layer, false to skip it
   */
  layerFilter(layerState: State): boolean {
    return true;
  }

  /**
   * Decide to skip some geometries.
   * Useful to avoid sending features outside the print extend on the wire.
   * @param geometry
   * @return true to convert this feature, false to skip it
   */
  geometryFilter(geometry: Geometry): boolean {
    // FIXME: shouldn't we provide some reasonable defaults here?
    // For ex:
    // - define a buffer of X pixels and remove all points outside it;
    // - only keep lines / polygons that intersect it
    // Cf schm for some code.
    return true;
  }

  /**
   * Can be used to add / remove properties to features
   * @param layerState
   * @param feature converted feature
   */
  feature(layerState: State, feature: GeoJSONFeature) {}

  /**
   * Can be used to manipulate the line symbolizers
   * @param layerState
   * @param symbolizer
   * @param stroke
   */
  line(layerState: State, geojsonFeature: GeoJSONFeature, symbolizer: MFPSymbolizerLine, stroke: Stroke) {}

  /**
   * Can be used to manipulate the image symbolizers
   * @param layerState
   * @param symbolizer
   * @param image
   */
  point(layerState: State, geojsonFeature: GeoJSONFeature, symbolizer: MFPSymbolizerPoint, image: Image) {}

  /**
   * Can be used to manipulate the text symbolizers
   * @param layerState
   * @param symbolizer
   * @param text
   */
  text(layerState: State, geojsonFeature: GeoJSONFeature, symbolizer: MFPSymbolizerText, text: Text) {}

  /**
   * Can be used to manipulate a converted WMTS layer
   * @param layerState
   * @param wmtsLayer
   * @param source
   */
  wmtsLayer(layerState: State, wmtsLayer: MFPWmtsLayer, source: WMTS) {}
  // FIXME: does it really makes sense?
  // Why isn't it done on an extended BaseEncoder instead?

  /**
   * Can be used to manipulate a converted WMS layer
   * @param layerState
   * @param wmsLayer
   * @param source
   */
  wmsLayer(layerState: State, wmsLayer: MFPWmsLayer, source: TileWMS) {}
}
