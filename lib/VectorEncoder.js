import { rgbArrayToHex } from "./utils.js";
import { GeoJSON as olFormatGeoJSON } from 'ol/format.js';
import { Circle as olStyleCircle, Icon as olStyleIcon } from 'ol/style.js';
import { getUid } from 'ol';
import { asArray } from 'ol/color.js';
import { toDegrees } from 'ol/math.js';
import VectorSource from 'ol/source/Vector.js';
export const PrintStyleType = {
    LINE_STRING: 'LineString',
    POINT: 'Point',
    POLYGON: 'Polygon',
};
export const PrintStyleTypes_ = {
    LineString: PrintStyleType.LINE_STRING,
    Point: PrintStyleType.POINT,
    Polygon: PrintStyleType.POLYGON,
    MultiLineString: PrintStyleType.LINE_STRING,
    MultiPoint: PrintStyleType.POINT,
    MultiPolygon: PrintStyleType.POLYGON,
};
const FEATURE_STYLE_PROP = '_gmfp_style';
const featureTypePriority_ = (feature) => {
    const geometry = feature.geometry;
    if (geometry && geometry.type === 'Point') {
        return 0;
    }
    else {
        return 1;
    }
};
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
    encodeVectorLayer(resolution) {
        const source = this.layer_.getSource();
        if (!source) {
            return null; // skipping
        }
        console.assert(source instanceof VectorSource);
        const features = source.getFeaturesInExtent(this.customizer_.printExtent);
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
        else {
            return null;
        }
    }
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
        else {
            const uid = ++this.lastDeepId_;
            this.deepIds_.set(key, uid);
            return uid.toString();
        }
    }
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
            if (textStyle !== null) {
                this.encodeVectorStyleText(styleObject.symbolizers, textStyle);
            }
        }
        return styleObject;
    }
    encodeVectorStyleFill(symbolizer, fillStyle) {
        let fillColor = fillStyle.getColor();
        if (fillColor !== null) {
            console.assert(typeof fillColor === 'string' || Array.isArray(fillColor));
            // @ts-ignore
            fillColor = asArray(fillColor);
            console.assert(Array.isArray(fillColor), 'only supporting fill colors');
            symbolizer.fillColor = rgbArrayToHex(fillColor);
            symbolizer.fillOpacity = fillColor[3];
        }
    }
    encodeVectorStyleLine(symbolizers, strokeStyle) {
        const symbolizer = {
            type: 'line',
        };
        this.encodeVectorStyleStroke(symbolizer, strokeStyle);
        this.customizer_.line(this.layerState_, symbolizer, strokeStyle);
        symbolizers.push(symbolizer);
    }
    encodeVectorStylePoint(symbolizers, imageStyle) {
        let symbolizer;
        if (imageStyle instanceof olStyleCircle) {
            symbolizer = {
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
        }
        else if (imageStyle instanceof olStyleIcon) {
            const src = imageStyle.getSrc();
            if (src !== undefined) {
                symbolizer = {
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
                    // Note: 'graphicWidth' is misnamed as of mapfish-print 3.14.1, it actually sets the height
                    symbolizer.graphicWidth = height;
                    this.addGraphicOffset_(symbolizer, imageStyle, width, height);
                }
                let rotation = imageStyle.getRotation();
                if (isNaN(rotation)) {
                    rotation = 0;
                }
                symbolizer.rotation = toDegrees(rotation);
            }
        }
        if (symbolizer !== undefined) {
            this.customizer_.point(this.layerState_, symbolizer, imageStyle);
            symbolizers.push(symbolizer);
        }
    }
    addGraphicOffset_(symbolizer, icon, width, height) {
        if (!this.hasDefaultAnchor_(icon)) {
            const topLeftOffset = icon.getAnchor();
            const centerXOffset = width / 2 - topLeftOffset[0];
            const centerYOffset = height / 2 - topLeftOffset[1];
            symbolizer.graphicXOffset = centerXOffset;
            symbolizer.graphicYOffset = centerYOffset;
        }
    }
    /**
     * @suppress {accessControls}
     */
    hasDefaultAnchor_(icon) {
        // prettier-ignore
        // @ts-ignore
        const hasDefaultCoordinates = icon.anchor_[0] === 0.5 && icon.anchor_[1] === 0.5;
        // @ts-ignore
        const hasDefaultOrigin = icon.anchorOrigin_ === 'top-left';
        // @ts-ignore
        const hasDefaultXUnits = icon.anchorXUnits_ === 'fraction';
        // @ts-ignore
        const hasDefaultYUnits = icon.anchorYUnits_ === 'fraction';
        return hasDefaultCoordinates && hasDefaultOrigin && hasDefaultXUnits && hasDefaultYUnits;
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmVjdG9yRW5jb2Rlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9WZWN0b3JFbmNvZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFDdEMsT0FBTyxFQUFDLE9BQU8sSUFBSSxlQUFlLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFFeEQsT0FBTyxFQUFDLE1BQU0sSUFBSSxhQUFhLEVBQUUsSUFBSSxJQUFJLFdBQVcsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUN6RSxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sSUFBSSxDQUFDO0FBQzFCLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDcEMsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUNyQyxPQUFPLFlBQVksTUFBTSxxQkFBcUIsQ0FBQztBQWdCL0MsTUFBTSxDQUFDLE1BQU0sY0FBYyxHQUFHO0lBQzVCLFdBQVcsRUFBRSxZQUFZO0lBQ3pCLEtBQUssRUFBRSxPQUFPO0lBQ2QsT0FBTyxFQUFFLFNBQVM7Q0FDVixDQUFDO0FBSVgsTUFBTSxDQUFDLE1BQU0sZ0JBQWdCLEdBQUc7SUFDOUIsVUFBVSxFQUFFLGNBQWMsQ0FBQyxXQUFXO0lBQ3RDLEtBQUssRUFBRSxjQUFjLENBQUMsS0FBSztJQUMzQixPQUFPLEVBQUUsY0FBYyxDQUFDLE9BQU87SUFDL0IsZUFBZSxFQUFFLGNBQWMsQ0FBQyxXQUFXO0lBQzNDLFVBQVUsRUFBRSxjQUFjLENBQUMsS0FBSztJQUNoQyxZQUFZLEVBQUUsY0FBYyxDQUFDLE9BQU87Q0FDNUIsQ0FBQztBQUVYLE1BQU0sa0JBQWtCLEdBQUcsYUFBYSxDQUFDO0FBRXpDLE1BQU0sb0JBQW9CLEdBQUcsQ0FBQyxPQUF1QixFQUFVLEVBQUU7SUFDL0QsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztJQUNsQyxJQUFJLFFBQVEs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