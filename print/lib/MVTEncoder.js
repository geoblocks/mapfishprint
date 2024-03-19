var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { getHeight as getExtentHeight, getWidth as getExtentWidth, } from 'ol/extent.js';
import { MVT } from 'ol/format.js';
import { createWorldToVectorContextTransform, listTilesCoveringExtentAtResolution, } from './encodeutils';
import { asOpacity } from './canvasUtils';
import { renderFeature } from 'ol/renderer/vector.js';
import { toContext } from 'ol/render.js';
import { transform2D } from 'ol/geom/flat/transform.js';
import CanvasBuilderGroup from 'ol/render/canvas/BuilderGroup.js';
import CanvasExecutorGroup from 'ol/render/canvas/ExecutorGroup.js';
import RBush from 'rbush';
import { VERSION } from 'ol';
var olMajorVersion = Number.parseInt(VERSION.split('.')[0]);
/**
 * Simple proxy to the fetch function for now.
 * Can be updated later to limit the number of concurrent requests.
 * Can be made to work on stub for testing.
 */
var PoolDownloader = /** @class */ (function () {
    function PoolDownloader() {
    }
    PoolDownloader.prototype.fetch = function (input, init) {
        return typeof fetch !== 'undefined'
            ? fetch(input, init)
            : Promise.reject('no Fetch');
    };
    return PoolDownloader;
}());
export { PoolDownloader };
var pool = new PoolDownloader();
var mvtFormat = new MVT();
/**
 * Encode an OpenLayers MVT layer to a list of canvases.
 */
var MVTEncoder = /** @class */ (function () {
    function MVTEncoder() {
    }
    /**
     * @param featuresExtent A list of features to render (in world coordinates)
     * @param styleFunction The style function for the features
     * @param styleResolution The resolution used in the style function
     * @param coordinateToPixelTransform World to CSS coordinates transform (top-left is 0)
     * @param context
     * @param renderBuffer
     * @param declutter
     */
    MVTEncoder.prototype.drawFeaturesToContextUsingRenderAPI_ = function (featuresExtent, styleFunction, styleResolution, coordinateToPixelTransform, context, renderBuffer, declutter) {
        var pixelRatio = 1;
        var builderGroup = new CanvasBuilderGroup(0, featuresExtent.extent, styleResolution, pixelRatio);
        var declutterBuilderGroup;
        if (declutter && olMajorVersion <= 9) {
            declutterBuilderGroup = new CanvasBuilderGroup(0, featuresExtent.extent, styleResolution, pixelRatio);
        }
        function resourceLoadedListener() {
            console.log('FIXME: some resource is now available, we should regenerate the image');
        }
        /**
         * @param feature
         * @this {CanvasVectorTileLayerRenderer}
         */
        var localRenderFeature = function (feature) {
            var styles;
            var sf = feature.getStyleFunction() || styleFunction;
            if (sf) {
                styles = sf(feature, styleResolution);
            }
            var loading = false;
            if (styles) {
                if (!Array.isArray(styles)) {
                    styles = [styles];
                }
                var tolerance = 0;
                for (var _i = 0, styles_1 = styles; _i < styles_1.length; _i++) {
                    var style = styles_1[_i];
                    loading =
                        renderFeature(builderGroup, feature, style, tolerance, resourceLoadedListener, undefined, olMajorVersion <= 9
                            ? declutterBuilderGroup
                            : declutter) || loading;
                }
            }
            return loading;
        };
        var loading = false;
        featuresExtent.features.forEach(function (f) {
            loading = localRenderFeature(f) || loading;
        });
        if (loading) {
            console.log('FIXME: some styles are still loading');
        }
        var sourceHasOverlaps = true; // we don't care about performance
        var executorGroupInstructions = builderGroup.finish();
        var renderingExecutorGroup = new CanvasExecutorGroup(featuresExtent.extent, styleResolution, pixelRatio, sourceHasOverlaps, executorGroupInstructions, renderBuffer);
        var transform = coordinateToPixelTransform;
        var viewRotation = 0;
        var snapToPixel = true;
        var scaledSize = olMajorVersion < 9
            ? 1
            : [context.canvas.width, context.canvas.height];
        renderingExecutorGroup.execute(context, scaledSize, transform, viewRotation, snapToPixel, undefined, null // we don't want to declutter the base layer
        );
        if (declutterBuilderGroup) {
            var declutterExecutorGroup = new CanvasExecutorGroup(featuresExtent.extent, styleResolution, pixelRatio, sourceHasOverlaps, declutterBuilderGroup.finish(), renderBuffer);
            declutterExecutorGroup.execute(context, scaledSize, transform, viewRotation, snapToPixel, undefined, declutter);
        }
    };
    /**
     *
     * @param features A list of features to render (in world coordinates)
     * @param styleFunction The style function for the features
     * @param styleResolution The resolution used in the style function
     * @param coordinateToPixelTransform World to CSS coordinates transform (top-left is 0)
     * @param vectorContext
     */
    MVTEncoder.prototype.drawFeaturesToContextUsingImmediateAPI_ = function (features, styleFunction, styleResolution, coordinateToPixelTransform, vectorContext) {
        var toDraw = [];
        var i = 0;
        features.forEach(function (f) {
            var styles = styleFunction(f, styleResolution);
            if (styles) {
                if (!Array.isArray(styles)) {
                    toDraw.push({
                        zIndex: styles.getZIndex(),
                        feature: f,
                        naturalOrder: ++i,
                        styleIdx: -1,
                    });
                }
                else {
                    styles.forEach(function (style, sIdx) {
                        toDraw.push({
                            zIndex: style.getZIndex(),
                            feature: f,
                            naturalOrder: ++i,
                            styleIdx: sIdx,
                        });
                    });
                }
            }
        });
        // sort is stable for newer browsers
        // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#description
        // for security we handle the stability ourself
        toDraw.sort(function (a, b) {
            var r = (a.zIndex || 0) - (b.zIndex || 0);
            return r || a.naturalOrder - b.naturalOrder;
        });
        // In order to honour zIndex we do drawing in 2 steps:
        // - first we create a list of geometries + style to render and order it by zIndex
        // - then we re-apply the style and draw.
        // We can not simply keep a reference to the style because they are mutable: some styles are reused
        // for several features and the value would be overwritten otherwise.
        for (var _i = 0, toDraw_1 = toDraw; _i < toDraw_1.length; _i++) {
            var item = toDraw_1[_i];
            var styles = styleFunction(item.feature, styleResolution);
            var style = item.styleIdx === -1 ? styles : styles[item.styleIdx];
            vectorContext.setStyle(style);
            // Keep it simple by systematically getting the geometry either from the style or from the feature
            // Then the coordinates are transformed
            var geometry = style.getGeometry();
            if (typeof geometry === 'function') {
                geometry = geometry();
            }
            if (!geometry) {
                geometry = item.feature.getGeometry();
            }
            // poor man copy
            geometry = Object.assign(Object.create(Object.getPrototypeOf(geometry)), geometry);
            // FIXME: can we avoid accessing private properties?
            var inCoos = geometry['flatCoordinates_'];
            var outCoos = (geometry['flatCoordinates_'] = new Array(inCoos.length));
            var stride = geometry.getStride();
            transform2D(inCoos, 0, inCoos.length, stride, coordinateToPixelTransform, outCoos);
            // Finally draw the feature with previously set style
            vectorContext.drawGeometry(geometry);
        }
    };
    MVTEncoder.prototype.snapTileResolution = function (tileGrid, targetResolution) {
        var resolutions = tileGrid.getResolutions();
        var resolution = resolutions[resolutions.length - 2]; // the last one is exclusive?
        for (var i = resolutions.length - 2; i >= 0; i--) {
            var r = resolutions[i];
            if (r <= targetResolution) {
                resolution = r;
            }
            else {
                break;
            }
        }
        return resolution;
    };
    MVTEncoder.prototype.assertCanvasSize = function (printExtent, canvasSize) {
        var eRatio = getExtentWidth(printExtent) / getExtentHeight(printExtent);
        var cRatio = canvasSize[0] / canvasSize[1];
        if (Math.abs(eRatio / cRatio - 1) > 0.02) {
            var msg = "The print extent ratio ".concat(eRatio, " and the canvas ratio ").concat(cRatio, " mismatch: ").concat(Math.abs(eRatio / cRatio - 1) * 100, " %");
            throw new Error(msg);
        }
    };
    // avoid polyfilling
    MVTEncoder.prototype.allFullfilled = function (promises) {
        return __awaiter(this, void 0, void 0, function () {
            var settled, _i, promises_1, p;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        settled = [];
                        _i = 0, promises_1 = promises;
                        _a.label = 1;
                    case 1:
                        if (!(_i < promises_1.length)) return [3 /*break*/, 4];
                        p = promises_1[_i];
                        return [4 /*yield*/, p.then(function (s) { return settled.push(s); }, function () {
                                // empty
                            })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, settled];
                }
            });
        });
    };
    MVTEncoder.prototype.fetchFeatures = function (mvtTiles, source) {
        return __awaiter(this, void 0, void 0, function () {
            var urlFunction, projection, featuresPromises;
            return __generator(this, function (_a) {
                urlFunction = source.getTileUrlFunction();
                projection = source.getProjection();
                featuresPromises = mvtTiles.map(function (t) {
                    // pixelratio and projection are not used
                    var url = urlFunction(t.coord, 1, projection);
                    if (!url) {
                        return Promise.reject('Could not create URL');
                    }
                    return pool
                        .fetch(url)
                        .then(function (r) { return r.arrayBuffer(); })
                        .then(function (data) {
                        var features = mvtFormat.readFeatures(data, {
                            extent: t.extent,
                            featureProjection: projection,
                        });
                        return {
                            features: features,
                            extent: t.extent,
                            url: url,
                        };
                    });
                });
                // keep only the fullfiled ones
                return [2 /*return*/, this.allFullfilled(featuresPromises)];
            });
        });
    };
    /**
     * @param options
     */
    MVTEncoder.prototype.encodeMVTLayer = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var layer, outputFormat, renderBuffer, source, tileGrid, tileResolution, printExtent, mvtTiles, featuresAndExtents, canvasSize, renderTiles, styleResolution, layerStyleFunction, layerOpacity, declutter, encodedLayers;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        layer = options.layer;
                        outputFormat = options.outputFormat || 'png';
                        renderBuffer = layer.getRenderBuffer() || 100;
                        source = layer.getSource();
                        tileGrid = source.getTileGrid();
                        tileResolution = this.snapTileResolution(tileGrid, options.tileResolution);
                        if (tileResolution !== options.tileResolution) {
                            console.warn("snapped and tile resolution mismatch: ".concat(tileResolution, " != ").concat(options.tileResolution));
                            options.tileResolution = tileResolution;
                        }
                        printExtent = options.printExtent;
                        mvtTiles = listTilesCoveringExtentAtResolution(printExtent, tileResolution, tileGrid);
                        return [4 /*yield*/, this.fetchFeatures(mvtTiles, source)];
                    case 1:
                        featuresAndExtents = _a.sent();
                        canvasSize = options.canvasSize;
                        this.assertCanvasSize(printExtent, canvasSize);
                        renderTiles = [
                            {
                                printExtent: printExtent, // print extent
                                canvasSize: canvasSize,
                            },
                        ];
                        styleResolution = options.styleResolution || tileResolution;
                        layerStyleFunction = layer.getStyleFunction();
                        layerOpacity = layer.get('opacity');
                        declutter = olMajorVersion < 9
                            ? (layer.getDeclutter()
                                ? new RBush(7)
                                : undefined)
                            : !!layer.getDeclutter();
                        encodedLayers = renderTiles.map(function (rt) {
                            return _this.renderTile(featuresAndExtents, rt.printExtent, rt.canvasSize, styleResolution, layerStyleFunction, layerOpacity, renderBuffer, declutter, outputFormat);
                        });
                        return [2 /*return*/, encodedLayers];
                }
            });
        });
    };
    MVTEncoder.prototype.renderTile = function (featuresExtents, rtExtent, canvasSize, styleResolution, layerStyleFunction, layerOpacity, renderBuffer, declutter, outputFormat) {
        var _this = this;
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        console.assert(ctx, "Could not get the context ".concat(canvas.width, "x").concat(canvas.height));
        var vectorContext = toContext(ctx, {
            size: canvasSize,
            pixelRatio: 1,
        });
        featuresExtents.forEach(function (ft) {
            var transform = createWorldToVectorContextTransform(rtExtent, canvas.width, canvas.height);
            if (MVTEncoder.useImmediateAPI) {
                _this.drawFeaturesToContextUsingImmediateAPI_(ft.features, layerStyleFunction, styleResolution, transform, vectorContext);
            }
            else {
                _this.drawFeaturesToContextUsingRenderAPI_(ft, layerStyleFunction, styleResolution, transform, ctx, renderBuffer, declutter);
            }
        });
        var baseUrl = (layerOpacity === 1 ? canvas : asOpacity(canvas, layerOpacity)).toDataURL(outputFormat);
        return {
            extent: rtExtent,
            baseURL: baseUrl,
        };
    };
    MVTEncoder.useImmediateAPI = false;
    return MVTEncoder;
}());
export default MVTEncoder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTVZURW5jb2Rlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9NVlRFbmNvZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQU1BLE9BQU8sRUFFTCxTQUFTLElBQUksZUFBZSxFQUM1QixRQUFRLElBQUksY0FBYyxHQUMzQixNQUFNLGNBQWMsQ0FBQztBQUN0QixPQUFPLEVBQUMsR0FBRyxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBRWpDLE9BQU8sRUFFTCxtQ0FBbUMsRUFDbkMsbUNBQW1DLEdBQ3BDLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDeEMsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3BELE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDdkMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBRXRELE9BQU8sa0JBQWtCLE1BQU0sa0NBQWtDLENBQUM7QUFDbEUsT0FBTyxtQkFBbUIsTUFBTSxtQ0FBbUMsQ0FBQztBQUNwRSxPQUFPLEtBQUssTUFBTSxPQUFPLENBQUM7QUFFMUIsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLElBQUksQ0FBQztBQUczQixJQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUU5RDs7OztHQUlHO0FBQ0g7SUFBQTtJQU1BLENBQUM7SUFMQyw4QkFBSyxHQUFMLFVBQU0sS0FBa0IsRUFBRSxJQUFrQjtRQUMxQyxPQUFPLE9BQU8sS0FBSyxLQUFLLFdBQVc7WUFDakMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDO1lBQ3BCLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFB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