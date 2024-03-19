import type {Feature as GeoJSONFeature, FeatureCollection as GeoJSONFeatureCollection} from 'geojson';

export interface MFPLayer {
  renderAsSvg?: boolean;
  failOnError?: boolean;
  type: string;
  opacity: number;
  name: string;
}

export interface MFPSymbolizer {
  type: string;
}

interface MFPStrokeStyle {
  strokeColor: string;
  strokeOpacity: number;
  strokeWidth: number;
  strokeDashstyle: string;
  strokeLinecap: string;
  strokeLinejoin: string;
}

interface MFPFillStyle {
  fillColor: string;
  fillOpacity: number;
}

export interface MFPSymbolizerPoint extends MFPSymbolizer, MFPStrokeStyle, MFPFillStyle {
  type: 'point';
  pointRadius: number;
  externalGraphic: string;
  graphicOpacity: number;
  graphicWidth: number;
  graphicXOffset: number;
  graphicYOffset: number;
  rotation: number;
}

export interface MFPSymbolizerLine extends MFPSymbolizer, MFPStrokeStyle {
  type: 'line';
}

export interface MFPSymbolizerPolygon extends MFPSymbolizer, MFPStrokeStyle, MFPFillStyle {
  type: 'polygon';
}

export interface MFPSymbolizerText extends MFPSymbolizer, MFPFillStyle {
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

export interface MFPSymbolizers {
  symbolizers: MFPSymbolizer[];
}

export type MFPVectorStyle = MFPSymbolizers | Record<string, number>;

export interface MFPVectorLayer extends MFPLayer {
  type: 'geojson';
  geoJson: GeoJSONFeature | GeoJSONFeatureCollection | string;
  style: MFPVectorStyle;
}

export interface MFPWmtsMatrix {
  identifier: string;
  scaleDenominator: number;
  tileSize: number[];
  topLeftCorner: number[];
  matrixSize: number[];
}

export interface MFPWmtsLayer extends MFPLayer {
  type: 'wmts';
  baseURL: string;
  dimensions: string[];
  dimensionParams: Record<string, string>;
  imageFormat: string;
  layer: string;
  matrices: MFPWmtsMatrix[];
  matrixSet: string;
  requestEncoding: 'KVP' | 'REST';
  style: string;
  version: string;
}

export interface MFPWmsLayer extends MFPLayer {
  type: 'wms';
  baseURL: string;
  imageFormat: string;
  layers: string[];
  customParams: Record<string, string>;
  /** The server type ("mapserver", "geoserver" or "qgisserver"). */
  serverType: string;
  opacity: number;
  version: string;
  styles: string[];
  /** For GeoServer, and MapServer, ask the map server to do the rotation. */
  useNativeAngle: boolean;
}

export interface MFPImageLayer extends MFPLayer {
  type: 'image';
  extent: number[];
  imageFormat: string;
  opacity: number;
  name: string;
  baseURL: string;
}

export interface MFPOSMLayer extends MFPLayer {
  type: 'osm';
  baseURL: string;
  // dpi: number;
  // customParams?: any[];
  // imageExtension: string;
  // layer: string;
  // rasterStyle: string;
}

export interface MFPMap {
  box?: number[];
  center: number[];
  scale: number;
  dpi: number;
  layers: MFPLayer[];
  projection: string;
  rotation: number;
  useNearestScale?: boolean;
  /* Allow transparency property. Default to false */
  pdfA?: boolean;
}

export interface MFPAttributes {
  map: MFPMap;
}

export interface MFPSpec {
  attributes: Partial<MFPAttributes>;
  layout: string;
  format: string;
  smtp?: Record<string, string>;
}

export interface MFPReportResponse {
  ref: string;
  statusURL: string;
  downloadURL: string;
}

export interface MFPStatusResponse {
  done: boolean;
  downloadURL: string;
  elapsedTime: number;
  error?: string;
  status: string;
  waitingTime: number;
}

export interface MFPCancelResponse {
  status: number;
}
