import {rgbArrayToHex} from './utils';
import {GeoJSON as olFormatGeoJSON} from 'ol/format.js';
import type {Fill, Icon, Image, Stroke, Style, Text} from 'ol/style.js';
import {Circle as olStyleCircle, Icon as olStyleIcon} from 'ol/style.js';
import {getUid} from 'ol';
import {asArray} from 'ol/color.js';
import {toDegrees} from 'ol/math.js';
import VectorSource from 'ol/source/Vector.js';
import type VectorLayer from 'ol/layer/Vector.js';
import type BaseCustomizer from './BaseCustomizer';
import type {
  MFPSymbolizer,
  MFPSymbolizerLine,
  MFPSymbolizerPoint,
  MFPSymbolizerPolygon,
  MFPSymbolizers,
  MFPSymbolizerText,
  MFPVectorLayer,
  MFPVectorStyle,
} from './types';
import type {State} from 'ol/layer/Layer.js';
import type {Feature as GeoJSONFeature, FeatureCollection as GeoJSONFeatureCollection} from 'geojson';

/** Represents the different types of printing styles. */
export const PrintStyleType = {
  LINE_STRING: 'LineString',
  POINT: 'Point',
  POLYGON: 'Polygon',
} as const;

/** Supported geometry types */
type GeometryType = 'LineString' | 'Point' | 'Polygon' | 'MultiLineString' | 'MultiPolygon';

/** Link between supported geometry and print style types. */
export const PrintStyleTypes_ = {
  LineString: PrintStyleType.LINE_STRING,
  Point: PrintStyleType.POINT,
  Polygon: PrintStyleType.POLYGON,
  MultiLineString: PrintStyleType.LINE_STRING,
  MultiPoint: PrintStyleType.POINT,
  MultiPolygon: PrintStyleType.POLYGON,
} as const;

/** Key prefix to feature style prop */
const FEATURE_STYLE_PROP = '_mfp_style';

/**
 * Calculates the priority of a GeoJSON feature based on its feature type.
 * For sort functions, to let points appearing to the top.
 * @returns The priority value.
 */
const featureTypePriority_ = (feature: GeoJSONFeature): number => {
  const geometry = feature.geometry;
  if (geometry && geometry.type === 'Point') {
    return 0;
  } else {
    return 1;
  }
};

/**
 * @returns A string or an array of strings into a formatted style key.
 */
const styleKey = (styles: string | string[]): string => {
  const keys = Array.isArray(styles) ? styles.join(',') : styles;
  return `[${FEATURE_STYLE_PROP} = '${keys}']`;
};

/**
 * Convert a given OpenLayers layer to the MapFishPrint v3 format.
 * The conversion can be customized by:
 * - extending the class;
 * - passing a customizer.
 */
export default class VectorEncoder {
  private layerState_: State;
  private layer_: VectorLayer<VectorSource>;
  private customizer_: BaseCustomizer;
  private geojsonFormat = new olFormatGeoJSON();
  private deepIds_: Map<string, number> = new Map();
  private lastDeepId_ = 0;

  constructor(layerState: State, customizer: BaseCustomizer) {
    this.layerState_ = layerState;
    this.layer_ = this.layerState_.layer as VectorLayer<VectorSource>;
    this.customizer_ = customizer;
  }

  /**
   * Encodes the vector layer into a mapfish vector layer object.
   * @returns The encoded vector layer object or null if the layer is empty.
   */
  encodeVectorLayer(resolution: number): MFPVectorLayer | null {
    const source = this.layer_.getSource();
    if (!source) {
      return null; // skipping
    }
    console.assert(source instanceof VectorSource);

    const features = source.getFeaturesInExtent(this.customizer_.getPrintExtent());

    const geojsonFeatures: GeoJSONFeature[] = [];
    const mapfishStyleObject: MFPVectorStyle = {
      version: 2,
    };

    features.forEach((feature) => {
      let styleData = null;
      const styleFunction = feature.getStyleFunction() || this.layer_.getStyleFunction();
      if (styleFunction) {
        styleData = styleFunction(feature, resolution) as null | Style | Style[];
      }
      const origGeojsonFeature = this.geojsonFormat.writeFeatureObject(feature);

      let styles = styleData !== null && !Array.isArray(styleData) ? [styleData] : (styleData as Style[]);
      if (!styles) {
        return;
      }
      styles = styles.filter((style) => !!style);
      if (styles.length === 0) {
        return;
      }
      console.assert(Array.isArray(styles));
      let isOriginalFeatureAdded = false;
      for (let j = 0, jj = styles.length; j < jj; ++j) {
        const style = styles[j];
        // FIXME: the return of the function is very complicate and would require
        // handling more cases than we actually do
        let geometry: any = style.getGeometry();
        let geojsonFeature;
        if (geometry) {
          const styledFeature = feature.clone();
          styledFeature.setGeometry(geometry);
          geojsonFeature = this.geojsonFormat.writeFeatureObject(styledFeature);
          geojsonFeatures.push(geojsonFeature);
        } else {
          geojsonFeature = origGeojsonFeature;
          geometry = feature.getGeometry();
          // no need to encode features with no geometry
          if (!geometry) {
            continue;
          }
          if (!this.customizer_.geometryFilter(geometry)) {
            continue;
          }
          if (!isOriginalFeatureAdded) {
            geojsonFeatures.push(geojsonFeature);
            isOriginalFeatureAdded = true;
          }
        }

        const geometryType = geometry.getType();
        this.addVectorStyle(mapfishStyleObject, geojsonFeature, geometryType, style);
      }
    });

    // MapFish Print fails if there are no style rules, even if there are no
    // features either. To work around this we just ignore the layer if the
    // array of GeoJSON features is empty.
    // See https://github.com/mapfish/mapfish-print/issues/279

    if (geojsonFeatures.length > 0) {
      // Reorder features: put points last, such that they appear on top
      geojsonFeatures.sort((feature0, feature1) => {
        const priority = featureTypePriority_;
        return priority(feature1) - priority(feature0);
      });

      const geojsonFeatureCollection = {
        type: 'FeatureCollection',
        features: geojsonFeatures,
      } as GeoJSONFeatureCollection;
      return {
        geoJson: geojsonFeatureCollection,
        opacity: this.layerState_.opacity,
        style: mapfishStyleObject,
        type: 'geojson',
        name: this.layer_.get('name'),
      };
    }
    return null;
  }

  /**
   * @returns The unique identifier for the given style.
   */
  getDeepStyleUid(style: Style): string {
    const todo = [style];
    let key = '';
    while (todo.length) {
      const obj = todo.pop()!;
      key += '_k' + getUid(obj);
      for (const [k, value] of Object.entries(obj)) {
        if (value !== null && value !== undefined) {
          if (['number', 'string', 'boolean'].includes(typeof value)) {
            key += `_${k}:${value}`;
          } else {
            todo.push(value);
          }
        }
      }
    }
    if (this.deepIds_.has(key)) {
      return this.deepIds_.get(key)!.toString();
    }
    const uid = ++this.lastDeepId_;
    this.deepIds_.set(key, uid);
    return uid.toString();
  }

  /**
   * Adds a vector style to the mapfishStyleObject based on the given parameters.
   */
  addVectorStyle(
    mapfishStyleObject: MFPVectorStyle,
    geojsonFeature: GeoJSONFeature,
    geometryType: GeometryType,
    style: Style,
  ) {
    const styleId = this.getDeepStyleUid(style);
    const key = styleKey(styleId);
    let hasSymbolizer;
    if (key in mapfishStyleObject) {
      // do nothing if we already have a style object for this CQL rule
      hasSymbolizer = true;
    } else {
      const styleObject = this.encodeVectorStyle(geometryType, style);
      hasSymbolizer = styleObject && styleObject.symbolizers.length !== 0;
      if (hasSymbolizer) {
        // @ts-ignore
        mapfishStyleObject[key] = styleObject;
      }
    }

    if (hasSymbolizer) {
      if (!geojsonFeature.properties) {
        geojsonFeature.properties = {};
      }
      this.customizer_.feature(this.layerState_, geojsonFeature);
      const existingStylesIds = geojsonFeature.properties[FEATURE_STYLE_PROP];
      if (existingStylesIds) {
        // multiple styles: merge symbolizers
        const styleIds = [...existingStylesIds.split(','), styleId];
        // @ts-ignore
        mapfishStyleObject[styleKey(styleIds)] = {
          symbolizers: [
            // @ts-ignore
            ...mapfishStyleObject[styleKey(existingStylesIds)].symbolizers,
            // @ts-ignore
            ...mapfishStyleObject[key].symbolizers,
          ],
        };
        geojsonFeature.properties[FEATURE_STYLE_PROP] = styleIds.join(',');
      } else {
        geojsonFeature.properties[FEATURE_STYLE_PROP] = styleId;
      }
    }
  }

  /**
   * Encodes the vector style based on the geometry type and style.
   * @returns The encoded vector style, or null if the geometry type is unsupported.
   */
  encodeVectorStyle(geometryType: GeometryType, style: Style): MFPSymbolizers | null {
    if (!(geometryType in PrintStyleTypes_)) {
      // unsupported geometry type
      return null;
    }
    const styleType = PrintStyleTypes_[geometryType];
    const styleObject = {
      symbolizers: [],
    } as MFPSymbolizers;
    const fillStyle = style.getFill();
    const imageStyle = style.getImage();
    const strokeStyle = style.getStroke();
    const textStyle = style.getText();
    if (styleType === PrintStyleType.POLYGON) {
      if (fillStyle !== null) {
        this.encodeVectorStylePolygon(styleObject.symbolizers, fillStyle, strokeStyle);
      }
    } else if (styleType === PrintStyleType.LINE_STRING) {
      if (strokeStyle !== null) {
        this.encodeVectorStyleLine(styleObject.symbolizers, strokeStyle);
      }
    } else if (styleType === PrintStyleType.POINT) {
      if (imageStyle !== null) {
        this.encodeVectorStylePoint(styleObject.symbolizers, imageStyle);
      }
    }
    if (textStyle !== null) {
      this.encodeVectorStyleText(styleObject.symbolizers, textStyle);
    }
    return styleObject;
  }

  /**
   * Encodes the vector style fill for a symbolizer.
   */
  protected encodeVectorStyleFill(
    symbolizer: MFPSymbolizerPoint | MFPSymbolizerPolygon | MFPSymbolizerText,
    fillStyle: Fill,
  ) {
    let fillColor = fillStyle.getColor();
    if (fillColor === null) {
      return;
    }
    console.assert(typeof fillColor === 'string' || Array.isArray(fillColor));
    // @ts-ignore
    fillColor = asArray(fillColor);
    console.assert(Array.isArray(fillColor), 'only supporting fill colors');
    symbolizer.fillColor = rgbArrayToHex(fillColor);
    symbolizer.fillOpacity = fillColor[3];
  }

  /**
   * Encodes the vector style for a line symbolizer, using the given stroke style.
   */
  protected encodeVectorStyleLine(symbolizers: MFPSymbolizer[], strokeStyle: Stroke) {
    const symbolizer = {
      type: 'line',
    } as MFPSymbolizerLine;
    this.encodeVectorStyleStroke(symbolizer, strokeStyle);
    this.customizer_.line(this.layerState_, symbolizer, strokeStyle);
    symbolizers.push(symbolizer);
  }

  /**
   * Encodes a vector style point.
   */
  protected encodeVectorStylePoint(symbolizers: MFPSymbolizer[], imageStyle: Image) {
    let symbolizer: MFPSymbolizerPoint | undefined;
    if (imageStyle instanceof olStyleCircle) {
      symbolizer = this.encodeVectorStylePointStyleCircle(imageStyle);
    } else if (imageStyle instanceof olStyleIcon) {
      symbolizer = this.encodeVectorStylePointStyleIcon(imageStyle);
    }
    if (symbolizer) {
      this.customizer_.point(this.layerState_, symbolizer, imageStyle);
      symbolizers.push(symbolizer);
    }
  }

  /**
   * Encodes the vector style point style circle.
   * @returns The encoded symbolizer point.
   */
  protected encodeVectorStylePointStyleCircle(imageStyle: olStyleCircle): MFPSymbolizerPoint {
    const symbolizer = {
      type: 'point',
    } as MFPSymbolizerPoint;
    symbolizer.pointRadius = imageStyle.getRadius();
    const scale = imageStyle.getScale();
    if (scale) {
      if (Array.isArray(scale)) {
        symbolizer.pointRadius *= (scale[0] + scale[1]) / 2;
      } else {
        symbolizer.pointRadius *= scale;
      }
    }
    const fillStyle = imageStyle.getFill();
    if (fillStyle !== null) {
      this.encodeVectorStyleFill(symbolizer, fillStyle);
    }
    const strokeStyle = imageStyle.getStroke();
    if (strokeStyle !== null) {
      this.encodeVectorStyleStroke(symbolizer, strokeStyle);
    }
    return symbolizer;
  }

  /**
   * Encodes a Vector Style point style icon.
   * @returns The encoded symbolizer point style or undefined if imageStyle src is undefined.
   */
  protected encodeVectorStylePointStyleIcon(imageStyle: olStyleIcon): MFPSymbolizerPoint | undefined {
    const src = imageStyle.getSrc();
    if (src === undefined) {
      return undefined;
    }
    const symbolizer = {
      type: 'point',
      externalGraphic: src,
    } as MFPSymbolizerPoint;
    const opacity = imageStyle.getOpacity();
    if (opacity !== null) {
      symbolizer.graphicOpacity = opacity;
    }
    const size = imageStyle.getSize();
    if (size !== null) {
      let scale = imageStyle.getScale();
      if (Array.isArray(scale)) {
        scale = (scale[0] + scale[1]) / 2;
      }
      if (isNaN(scale)) {
        scale = 1;
      }
      const width = size[0] * scale;
      const height = size[1] * scale;

      // Note: 'graphicWidth' is misnamed as of mapfish-console.log 3.14.1, it actually sets the height
      symbolizer.graphicWidth = height;

      this.addGraphicOffset_(symbolizer, imageStyle, width, height);
    }
    let rotation = imageStyle.getRotation();
    if (isNaN(rotation)) {
      rotation = 0;
    }
    symbolizer.rotation = toDegrees(rotation);
    return symbolizer;
  }

  /**
   * Add the graphic offset to the symbolizer.
   */
  addGraphicOffset_(symbolizer: MFPSymbolizerPoint, icon: Icon, width: number, height: number) {
    if (this.hasDefaultAnchor_(icon)) {
      return;
    }
    const topLeftOffset = icon.getAnchor();
    const centerXOffset = width / 2 - topLeftOffset[0];
    const centerYOffset = height / 2 - topLeftOffset[1];
    symbolizer.graphicXOffset = centerXOffset;
    symbolizer.graphicYOffset = centerYOffset;
  }

  /**
   * Checks if the provided icon has default anchor properties.
   * @returns true if the icon has default anchor properties, otherwise false.
   */
  hasDefaultAnchor_(icon: Icon) {
    // @ts-ignore
    const icon_ = icon as any;
    const hasDefaultCoordinates = icon_.anchor_[0] === 0.5 && icon_.anchor_[1] === 0.5;
    const hasDefaultOrigin = icon_.anchorOrigin_ === 'top-left';
    const hasDefaultXUnits = icon_.anchorXUnits_ === 'fraction';
    const hasDefaultYUnits = icon_.anchorYUnits_ === 'fraction';
    return hasDefaultCoordinates && hasDefaultOrigin && hasDefaultXUnits && hasDefaultYUnits;
  }

  /**
   * Encodes the vector style of a polygon by applying fill and stroke styles.
   */
  protected encodeVectorStylePolygon(symbolizers: MFPSymbolizer[], fillStyle: Fill, strokeStyle: Stroke) {
    const symbolizer = {
      type: 'polygon',
    } as MFPSymbolizerPolygon;
    this.encodeVectorStyleFill(symbolizer, fillStyle);
    if (strokeStyle !== null) {
      this.encodeVectorStyleStroke(symbolizer, strokeStyle);
    }
    symbolizers.push(symbolizer);
  }

  /**
   * Encodes the vector style stroke properties.
   */
  protected encodeVectorStyleStroke(
    symbolizer: MFPSymbolizerPoint | MFPSymbolizerLine | MFPSymbolizerPolygon,
    strokeStyle: Stroke,
  ) {
    const strokeColor = strokeStyle.getColor();
    if (strokeColor !== null) {
      console.assert(typeof strokeColor === 'string' || Array.isArray(strokeColor));
      // @ts-ignore
      const strokeColorRgba = asArray(strokeColor);
      console.assert(Array.isArray(strokeColorRgba), 'only supporting stroke colors');
      symbolizer.strokeColor = rgbArrayToHex(strokeColorRgba);
      symbolizer.strokeOpacity = strokeColorRgba[3];
    }
    const strokeDashstyle = strokeStyle.getLineDash();
    if (strokeDashstyle !== null) {
      symbolizer.strokeDashstyle = strokeDashstyle.join(' ');
    }
    const strokeWidth = strokeStyle.getWidth();
    if (strokeWidth !== undefined) {
      symbolizer.strokeWidth = strokeWidth;
    }
    const strokeLineCap = strokeStyle.getLineCap();
    if (strokeLineCap) {
      symbolizer.strokeLinecap = strokeLineCap;
    }

    const strokeLineJoin = strokeStyle.getLineJoin();
    if (strokeLineJoin) {
      symbolizer.strokeLinejoin = strokeLineJoin;
    }
  }

  /**
   * Encodes vector style text.
   */
  protected encodeVectorStyleText(symbolizers: MFPSymbolizer[], textStyle: Text) {
    const label = textStyle.getText();
    if (label) {
      const symbolizer = {
        type: 'text',
        label: textStyle.getText(),
        fontFamily: textStyle.getFont() ? textStyle.getFont() : 'sans-serif',
        labelXOffset: textStyle.getOffsetX(),
        labelYOffset: textStyle.getOffsetY(),
        labelAlign: 'cm',
      } as MFPSymbolizerText;
      const fillStyle = textStyle.getFill();
      if (fillStyle !== null) {
        this.encodeVectorStyleFill(symbolizer, fillStyle);
        symbolizer.fontColor = symbolizer.fillColor;
      }
      const strokeStyle = textStyle.getStroke();
      if (strokeStyle !== null) {
        const strokeColor = strokeStyle.getColor();
        if (strokeColor) {
          console.assert(typeof strokeColor === 'string' || Array.isArray(strokeColor));
          // @ts-ignore
          const strokeColorRgba = asArray(strokeColor);
          console.assert(Array.isArray(strokeColorRgba), 'only supporting stroke colors');
          symbolizer.haloColor = rgbArrayToHex(strokeColorRgba);
          symbolizer.haloOpacity = strokeColorRgba[3];
        }
        const strokeWidth = strokeStyle.getWidth();
        if (strokeWidth !== undefined) {
          symbolizer.haloRadius = strokeWidth;
        }
      }
      symbolizers.push(symbolizer);
    }
  }
}
