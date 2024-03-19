import { rgbArrayToHex } from "./utils.js";
import { GeoJSON as olFormatGeoJSON } from 'ol/format.js';
import { Circle as olStyleCircle, Icon as olStyleIcon } from 'ol/style.js';
import { getUid } from 'ol';
import { asArray } from 'ol/color.js';
import { toDegrees } from 'ol/math.js';
import VectorSource from 'ol/source/Vector.js';
/** Represents the different types of printing styles. */
export const PrintStyleType = {
    LINE_STRING: 'LineString',
    POINT: 'Point',
    POLYGON: 'Polygon',
};
/** Link between supported geometry and print style types. */
export const PrintStyleTypes_ = {
    LineString: PrintStyleType.LINE_STRING,
    Point: PrintStyleType.POINT,
    Polygon: PrintStyleType.POLYGON,
    MultiLineString: PrintStyleType.LINE_STRING,
    MultiPoint: PrintStyleType.POINT,
    MultiPolygon: PrintStyleType.POLYGON,
};
/** Key prefix to feature style prop */
const FEATURE_STYLE_PROP = '_mfp_style';
/**
 * Calculates the priority of a GeoJSON feature based on its feature type.
 * For sort functions, to let points appearing to the top.
 * @returns The priority value.
 */
const featureTypePriority_ = (feature) => {
    const geometry = feature.geometry;
    if (geometry && geometry.type === 'Point') {
        return 0;
    }
    else {
        return 1;
    }
};
/**
 * @returns A string or an array of strings into a formatted style key.
 */
const styleKey = (styles) => {
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
    layerState_;
    layer_;
    customizer_;
    geojsonFormat = new olFormatGeoJSON();
    deepIds_ = new Map();
    lastDeepId_ = 0;
    constructor(layerState, customizer) {
        this.layerState_ = layerState;
        this.layer_ = this.layerState_.layer;
        this.customizer_ = customizer;
    }
    /**
     * Encodes the vector layer into a mapfish vector layer object.
     * @returns The encoded vector layer object or null if the layer is empty.
     */
    encodeVectorLayer(resolution) {
        const source = this.layer_.getSource();
        if (!source) {
            return null; // skipping
        }
        console.assert(source instanceof VectorSource);
        const features = source.getFeaturesInExtent(this.customizer_.getPrintExtent());
        const geojsonFeatures = [];
        const mapfishStyleObject = {
            version: 2,
        };
        features.forEach((feature) => {
            let styleData = null;
            const styleFunction = feature.getStyleFunction() || this.layer_.getStyleFunction();
            if (styleFunction) {
                styleData = styleFunction(feature, resolution);
            }
            const origGeojsonFeature = this.geojsonFormat.writeFeatureObject(feature);
            let styles = styleData !== null && !Array.isArray(styleData) ? [styleData] : styleData;
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
                let geometry = style.getGeometry();
                let geojsonFeature;
                if (geometry) {
                    const styledFeature = feature.clone();
                    styledFeature.setGeometry(geometry);
                    geojsonFeature = this.geojsonFormat.writeFeatureObject(styledFeature);
                    geojsonFeatures.push(geojsonFeature);
                }
                else {
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
            };
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
    getDeepStyleUid(style) {
        const todo = [style];
        let key = '';
        while (todo.length) {
            const obj = todo.pop();
            key += '_k' + getUid(obj);
            for (const [k, value] of Object.entries(obj)) {
                if (value !== null && value !== undefined) {
                    if (['number', 'string', 'boolean'].includes(typeof value)) {
                        key += `_${k}:${value}`;
                    }
                    else {
                        todo.push(value);
                    }
                }
            }
        }
        if (this.deepIds_.has(key)) {
            return this.deepIds_.get(key).toString();
        }
        const uid = ++this.lastDeepId_;
        this.deepIds_.set(key, uid);
        return uid.toString();
    }
    /**
     * Adds a vector style to the mapfishStyleObject based on the given parameters.
     */
    addVectorStyle(mapfishStyleObject, geojsonFeature, geometryType, style) {
        const styleId = this.getDeepStyleUid(style);
        const key = styleKey(styleId);
        let hasSymbolizer;
        if (key in mapfishStyleObject) {
            // do nothing if we already have a style object for this CQL rule
            hasSymbolizer = true;
        }
        else {
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
            }
            else {
                geojsonFeature.properties[FEATURE_STYLE_PROP] = styleId;
            }
        }
    }
    /**
     * Encodes the vector style based on the geometry type and style.
     * @returns The encoded vector style, or null if the geometry type is unsupported.
     */
    encodeVectorStyle(geometryType, style) {
        if (!(geometryType in PrintStyleTypes_)) {
            // unsupported geometry type
            return null;
        }
        const styleType = PrintStyleTypes_[geometryType];
        const styleObject = {
            symbolizers: [],
        };
        const fillStyle = style.getFill();
        const imageStyle = style.getImage();
        const strokeStyle = style.getStroke();
        const textStyle = style.getText();
        if (styleType === PrintStyleType.POLYGON) {
            if (fillStyle !== null) {
                this.encodeVectorStylePolygon(styleObject.symbolizers, fillStyle, strokeStyle);
            }
        }
        else if (styleType === PrintStyleType.LINE_STRING) {
            if (strokeStyle !== null) {
                this.encodeVectorStyleLine(styleObject.symbolizers, strokeStyle);
            }
        }
        else if (styleType === PrintStyleType.POINT) {
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
    encodeVectorStyleFill(symbolizer, fillStyle) {
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
    encodeVectorStyleLine(symbolizers, strokeStyle) {
        const symbolizer = {
            type: 'line',
        };
        this.encodeVectorStyleStroke(symbolizer, strokeStyle);
        this.customizer_.line(this.layerState_, symbolizer, strokeStyle);
        symbolizers.push(symbolizer);
    }
    /**
     * Encodes a vector style point.
     */
    encodeVectorStylePoint(symbolizers, imageStyle) {
        let symbolizer;
        if (imageStyle instanceof olStyleCircle) {
            symbolizer = this.encodeVectorStylePointStyleCircle(imageStyle);
        }
        else if (imageStyle instanceof olStyleIcon) {
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
    encodeVectorStylePointStyleCircle(imageStyle) {
        const symbolizer = {
            type: 'point',
        };
        symbolizer.pointRadius = imageStyle.getRadius();
        const scale = imageStyle.getScale();
        if (scale) {
            if (Array.isArray(scale)) {
                symbolizer.pointRadius *= (scale[0] + scale[1]) / 2;
            }
            else {
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
    encodeVectorStylePointStyleIcon(imageStyle) {
        const src = imageStyle.getSrc();
        if (src === undefined) {
            return undefined;
        }
        const symbolizer = {
            type: 'point',
            externalGraphic: src,
        };
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
    addGraphicOffset_(symbolizer, icon, width, height) {
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
    hasDefaultAnchor_(icon) {
        // @ts-ignore
        const icon_ = icon;
        const hasDefaultCoordinates = icon_.anchor_[0] === 0.5 && icon_.anchor_[1] === 0.5;
        const hasDefaultOrigin = icon_.anchorOrigin_ === 'top-left';
        const hasDefaultXUnits = icon_.anchorXUnits_ === 'fraction';
        const hasDefaultYUnits = icon_.anchorYUnits_ === 'fraction';
        return hasDefaultCoordinates && hasDefaultOrigin && hasDefaultXUnits && hasDefaultYUnits;
    }
    /**
     * Encodes the vector style of a polygon by applying fill and stroke styles.
     */
    encodeVectorStylePolygon(symbolizers, fillStyle, strokeStyle) {
        const symbolizer = {
            type: 'polygon',
        };
        this.encodeVectorStyleFill(symbolizer, fillStyle);
        if (strokeStyle !== null) {
            this.encodeVectorStyleStroke(symbolizer, strokeStyle);
        }
        symbolizers.push(symbolizer);
    }
    /**
     * Encodes the vector style stroke properties.
     */
    encodeVectorStyleStroke(symbolizer, strokeStyle) {
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
    encodeVectorStyleText(symbolizers, textStyle) {
        const label = textStyle.getText();
        if (label) {
            const symbolizer = {
                type: 'text',
                label: textStyle.getText(),
                fontFamily: textStyle.getFont() ? textStyle.getFont() : 'sans-serif',
                labelXOffset: textStyle.getOffsetX(),
                labelYOffset: textStyle.getOffsetY(),
                labelAlign: 'cm',
            };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmVjdG9yRW5jb2Rlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9WZWN0b3JFbmNvZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFDdEMsT0FBTyxFQUFDLE9BQU8sSUFBSSxlQUFlLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFFeEQsT0FBTyxFQUFDLE1BQU0sSUFBSSxhQUFhLEVBQUUsSUFBSSxJQUFJLFdBQVcsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUN6RSxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sSUFBSSxDQUFDO0FBQzFCLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDcEMsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUNyQyxPQUFPLFlBQVksTUFBTSxxQkFBcUIsQ0FBQztBQWdCL0MseURBQXlEO0FBQ3pELE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBRztJQUM1QixXQUFXLEVBQUUsWUFBWTtJQUN6QixLQUFLLEVBQUUsT0FBTztJQUNkLE9BQU8sRUFBRSxTQUFTO0NBQ1YsQ0FBQztBQUtYLDZEQUE2RDtBQUM3RCxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRztJQUM5QixVQUFVLEVBQUUsY0FBYyxDQUFDLFdBQVc7SUFDdEMsS0FBSyxFQUFFLGNBQWMsQ0FBQyxLQUFLO0lBQzNCLE9BQU8sRUFBRSxjQUFjLENBQUMsT0FBTztJQUMvQixlQUFlLEVBQUUsY0FBYyxDQUFDLFdBQVc7SUFDM0MsVUFBVSxFQUFFLGNBQWMsQ0FBQyxLQUFLO0lBQ2hDLFlBQVksRUFBRSxjQUFjLENBQUMsT0FBTztDQUM1QixDQUFDO0FBRVgsdUNBQXVDO0FBQ3ZDLE1BQU0sa0JBQWtCLEdBQUcsWUFBWSxDQUFDO0FBRXhDOzs7O0dBSUc7QUFDSCxNQUFNLG9CQUFvQixHQUFHLENBQUMsT0FBdUIsRUFBVSxFQUFFO0lBQy9E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