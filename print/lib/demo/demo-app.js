var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/* eslint-disable sort-imports-es6-autofix/sort-imports-es6 */
import Feature from 'ol/Feature.js';
import Icon from 'ol/style/Icon.js';
import MVT from 'ol/format/MVT.js';
import MVTEncoder from '../MVTEncoder';
import OLMap from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import Stroke from 'ol/style/Stroke.js';
import Style from 'ol/style/Style.js';
import Text from 'ol/style/Text.js';
import TileDebug from 'ol/source/TileDebug.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import VectorTileLayer from 'ol/layer/VectorTile.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import View from 'ol/View.js';
import { applyStyle } from 'ol-mapbox-style';
import { LitElement, css, html } from 'lit';
import { PDF_POINTS_PER_METER } from '../constants';
import { canvasSizeFromDimensionsInPdfPoints } from '../canvasUtils';
import { centerPrintExtent, drawPrintExtent } from '../postcompose';
import { customElement, query, state } from 'lit/decorators.js';
import { fromLonLat, toLonLat } from 'ol/proj.js';
import { olCss } from './css';
import { fromExtent as polygonFromExtent } from 'ol/geom/Polygon.js';
import { printerIcon } from '../printer';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
var defaults = {
    demo: 'mapbox1',
    declutter: true,
    immediateApi: false,
};
var DemoApp = /** @class */ (function (_super) {
    __extends(DemoApp, _super);
    function DemoApp() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.targetSizeInPdfPoints = [255, 355]; // 72pts / inch => ~[9cm, 12.5cm]
        _this.printScale = 1 / 5000;
        _this.dpi = 96; // let's take a value adapted for a screen. For a printer 254 would be better.
        _this.zoom = -1;
        _this.currentDemo = defaults.demo;
        _this.shouldDeclutter = defaults.declutter;
        _this.useImmediateApi = defaults.immediateApi;
        return _this;
    }
    DemoApp.prototype.configureVTStyle = function (layer, url, sourceId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, fetch(url)
                        .then(function (r) { return r.json(); })
                        .then(function (style) { return applyStyle(layer, style, sourceId); })];
            });
        });
    };
    DemoApp.prototype.createMap = function () {
        var _this = this;
        var _a;
        this.printExtentLayer = new VectorLayer({
            // @ts-ignore
            'name': 'printExtent',
            source: new VectorSource({
                features: [],
            }),
        });
        this.map = new OLMap({
            target: this.mapEl,
            layers: [],
            view: new View({
                zoom: 15,
            }),
        });
        this.shouldDeclutter = defaults.declutter;
        this.updateDemo(defaults.demo);
        this.map.on('postcompose', function (evt) {
            var res = evt.frameState.viewState.resolution;
            drawPrintExtent(evt, _this.getPrintExtentSizeForResolution(res, devicePixelRatio));
        });
        this.map.getView().on('change:resolution', function () {
            var _a;
            _this.zoom = ((_a = _this.map) === null || _a === void 0 ? void 0 : _a.getView().getZoom()) || -1;
        });
        this.zoom = ((_a = this.map) === null || _a === void 0 ? void 0 : _a.getView().getZoom()) || -1;
    };
    /**
     * @param resolution some resolution, typically the display resolution
     * @param pixelRatio typically the device pixel ratio
     * @return size
     */
    DemoApp.prototype.getPrintExtentSizeForResolution = function (resolution, pixelRatio) {
        var _this = this;
        return this.targetSizeInPdfPoints.map(function (side) {
            var metersOnTheMap = side / PDF_POINTS_PER_METER / _this.printScale;
            return (pixelRatio * metersOnTheMap) / resolution;
        });
    };
    DemoApp.prototype.firstUpdated = function () {
        this.createMap();
    };
    DemoApp.prototype.print = function () {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var encoder, viewResolution, size, peSize, pp, printExtent, canvasSize, options, result;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        MVTEncoder.useImmediateAPI = this.useImmediateApi;
                        encoder = new MVTEncoder();
                        viewResolution = this.map.getView().getResolution();
                        size = this.map.getSize();
                        peSize = this.getPrintExtentSizeForResolution(viewResolution, window.devicePixelRatio);
                        pp = centerPrintExtent(peSize, size[0], size[1]);
                        printExtent = __spreadArray(__spreadArray([], this.map.getCoordinateFromPixel([pp[0], pp[3]]), true), this.map.getCoordinateFromPixel([pp[2], pp[1]]), true);
                        (_b = (_a = this.printExtentLayer) === null || _a === void 0 ? void 0 : _a.getSource()) === null || _b === void 0 ? void 0 : _b.clear();
                        (_d = (_c = this.printExtentLayer) === null || _c === void 0 ? void 0 : _c.getSource()) === null || _d === void 0 ? void 0 : _d.addFeature(new Feature({
                            geometry: polygonFromExtent(printExtent),
                        }));
                        canvasSize = canvasSizeFromDimensionsInPdfPoints(this.targetSizeInPdfPoints, this.dpi);
                        console.log('Estimated size on screen', canvasSize.map(function (s) { return (s / 96) * 2.54; }));
                        options = {
                            layer: this.mvtLayer,
                            printExtent: printExtent,
                            tileResolution: viewResolution,
                            styleResolution: viewResolution,
                            canvasSize: canvasSize,
                        };
                        return [4 /*yield*/, encoder.encodeMVTLayer(options)];
                    case 1:
                        result = _e.sent();
                        console.log(result);
                        this.result0 = result[0];
                        return [2 /*return*/];
                }
            });
        });
    };
    DemoApp.prototype.configureSimpleDemo = function () {
        var _a, _b;
        this.mvtLayer = new VectorTileLayer({
            declutter: this.shouldDeclutter,
            style: function (feature) {
                var _a;
                if (((_a = feature.getGeometry()) === null || _a === void 0 ? void 0 : _a.getType()) === 'Point') {
                    return new Style({
                        text: new Text({
                            font: 'bold 28px beach',
                            text: 'beach',
                            offsetY: 40,
                        }),
                        image: new Icon({
                            src: "".concat(document.baseURI, "/beach.svg"),
                            opacity: 0.5,
                            scale: 0.05,
                        }),
                    });
                }
                return new Style({
                    stroke: new Stroke({
                        color: 'red',
                    }),
                });
            },
            source: new VectorTileSource({
                format: new MVT(),
                url: document.baseURI + 'tiles/{z}/{x}/{y}.pbf',
                maxZoom: 14,
                // extent: trackExtent,
            }),
        });
        var layers = (_a = this.map) === null || _a === void 0 ? void 0 : _a.getLayers();
        layers.clear();
        var newLayers = [
            new TileLayer({
                source: new OSM(),
            }),
            this.mvtLayer,
            this.printExtentLayer,
            new TileLayer({
                zIndex: 10000,
                source: new TileDebug({
                    tileGrid: this.mvtLayer.getSource().getTileGrid(),
                }),
            }),
        ];
        layers.extend(newLayers);
        (_b = this.map) === null || _b === void 0 ? void 0 : _b.getView().setCenter(fromLonLat([6.5725, 46.51339]));
    };
    DemoApp.prototype.configureMapboxDemo1 = function () {
        this.configureMapboxDemo('https://vectortiles.geo.admin.ch/styles/ch.swisstopo.leichte-basiskarte.vt/style.json', 'leichtebasiskarte_v3.0.1');
    };
    DemoApp.prototype.configureMapboxDemo = function (styleURL, sourceId) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var layers, newLayers;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.mvtLayer = new VectorTileLayer({
                            declutter: this.shouldDeclutter,
                        });
                        return [4 /*yield*/, this.configureVTStyle(this.mvtLayer, styleURL, sourceId)];
                    case 1:
                        _c.sent();
                        layers = (_a = this.map) === null || _a === void 0 ? void 0 : _a.getLayers();
                        layers.clear();
                        newLayers = [
                            this.mvtLayer,
                            this.printExtentLayer,
                            new TileLayer({
                                zIndex: 10000,
                                source: new TileDebug({
                                    tileGrid: this.mvtLayer.getSource().getTileGrid(),
                                }),
                            }),
                        ];
                        layers.extend(newLayers);
                        (_b = this.map) === null || _b === void 0 ? void 0 : _b.getView().setCenter(fromLonLat([7.44835, 46.94811]));
                        return [2 /*return*/];
                }
            });
        });
    };
    DemoApp.prototype.updateDemo = function (demo) {
        this.currentDemo = demo;
        switch (demo) {
            case 'simple':
                this.configureSimpleDemo();
                break;
            case 'mapbox1':
                this.configureMapboxDemo1();
                break;
            default:
        }
    };
    DemoApp.prototype.formatExtent = function (e) {
        var c0 = [e[0], e[1]];
        var c1 = [e[2], e[3]];
        var p1 = toLonLat(c0, 'EPSG:3857')
            .map(function (v) { return v.toFixed(3); })
            .join(', ');
        var p2 = toLonLat(c1, 'EPSG:3857')
            .map(function (v) { return v.toFixed(3); })
            .join(', ');
        return "[".concat(p1, ", ").concat(p2, "]");
    };
    DemoApp.prototype.render = function () {
        var _this = this;
        var img = '';
        var extent = '';
        if (this.result0) {
            var e = this.result0.extent;
            img = html(templateObject_1 || (templateObject_1 = __makeTemplateObject(["<img id=\"side\" src=\"", "\" />"], ["<img id=\"side\" src=\"", "\" />"])), this.result0.baseURL);
            extent = html(templateObject_2 || (templateObject_2 = __makeTemplateObject(["<span>", "</span>"], ["<span>", "</span>"])), this.formatExtent(e));
        }
        return html(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n      <button id=\"print\" @click=", ">\n        ", "\n      </button>\n      <label for=\"demo-select\">Choose a demo:</label>\n      <select\n        name=\"demos\"\n        id=\"demo-select\"\n        .value=\"", "\"\n        @change=", "\n      >\n        <option value=\"simple\">Basic style function</option>\n        <option value=\"mapbox1\">OL-Mapbox-style1</option>\n      </select>\n      <label>\n        <input\n          type=\"checkbox\"\n          ?checked=", "\n          @change=", "\n        />\n        declutter\n      </label>\n      <label>\n        <input\n          type=\"checkbox\"\n          ?checked=", "\n          @change=", "\n        />immediate API\n      </label>\n      <div>zoom: ", "</div>\n      <div>\n        printed extent: ", "\n      </div>\n      <div>\n        <div id=\"map\"></div>\n        ", "\n      </div>\n    "], ["\n      <button id=\"print\" @click=", ">\n        ", "\n      </button>\n      <label for=\"demo-select\">Choose a demo:</label>\n      <select\n        name=\"demos\"\n        id=\"demo-select\"\n        .value=\"", "\"\n        @change=", "\n      >\n        <option value=\"simple\">Basic style function</option>\n        <option value=\"mapbox1\">OL-Mapbox-style1</option>\n      </select>\n      <label>\n        <input\n          type=\"checkbox\"\n          ?checked=", "\n          @change=", "\n        />\n        declutter\n      </label>\n      <label>\n        <input\n          type=\"checkbox\"\n          ?checked=", "\n          @change=", "\n        />immediate API\n      </label>\n      <div>zoom: ", "</div>\n      <div>\n        printed extent: ", "\n      </div>\n      <div>\n        <div id=\"map\"></div>\n        ", "\n      </div>\n    "])), this.print, unsafeHTML(printerIcon), this.currentDemo, function (evt) { return _this.updateDemo(evt.target.value); }, this.shouldDeclutter, function (evt) {
            _this.shouldDeclutter = evt.target.checked;
            _this.updateDemo(_this.currentDemo);
        }, this.useImmediateApi, function (evt) {
            _this.useImmediateApi = evt.target.checked;
        }, this.zoom.toFixed(1), extent || 'Move around and click the print button...', img);
    };
    DemoApp.styles = [
        css(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n      :host {\n        display: block;\n        border: solid 1px gray;\n        padding: 16px;\n      }\n      #side {\n        background-color: lightgray;\n        display: inline-block;\n      }\n      #print {\n        width: 30px;\n        height: 30px;\n      }\n      #map {\n        display: inline-block;\n        width: 45%;\n        height: calc(100vh - 32px - 20px - 40px);\n      }\n    "], ["\n      :host {\n        display: block;\n        border: solid 1px gray;\n        padding: 16px;\n      }\n      #side {\n        background-color: lightgray;\n        display: inline-block;\n      }\n      #print {\n        width: 30px;\n        height: 30px;\n      }\n      #map {\n        display: inline-block;\n        width: 45%;\n        height: calc(100vh - 32px - 20px - 40px);\n      }\n    "]))),
        olCss,
    ];
    __decorate([
        query('#map')
    ], DemoApp.prototype, "mapEl", void 0);
    __decorate([
        state()
    ], DemoApp.prototype, "result0", void 0);
    __decorate([
        state()
    ], DemoApp.prototype, "zoom", void 0);
    __decorate([
        state()
    ], DemoApp.prototype, "currentDemo", void 0);
    __decorate([
        state()
    ], DemoApp.prototype, "shouldDeclutter", void 0);
    __decorate([
        state()
    ], DemoApp.prototype, "useImmediateApi", void 0);
    DemoApp = __decorate([
        customElement('demo-app')
    ], DemoApp);
    return DemoApp;
}(LitElement));
export { DemoApp };
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVtby1hcHAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZGVtby9kZW1vLWFwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsOERBQThEO0FBQzlELE9BQU8sT0FBTyxNQUFNLGVBQWUsQ0FBQztBQUVwQyxPQUFPLElBQUksTUFBTSxrQkFBa0IsQ0FBQztBQUNwQyxPQUFPLEdBQUcsTUFBTSxrQkFBa0IsQ0FBQztBQUNuQyxPQUFPLFVBQWdDLE1BQU0sZUFBZSxDQUFDO0FBQzdELE9BQU8sS0FBSyxNQUFNLFdBQVcsQ0FBQztBQUM5QixPQUFPLEdBQUcsTUFBTSxrQkFBa0IsQ0FBQztBQUNuQyxPQUFPLE1BQU0sTUFBTSxvQkFBb0IsQ0FBQztBQUN4QyxPQUFPLEtBQUssTUFBTSxtQkFBbUIsQ0FBQztBQUN0QyxPQUFPLElBQUksTUFBTSxrQkFBa0IsQ0FBQztBQUNwQyxPQUFPLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQztBQUMvQyxPQUFPLFNBQVMsTUFBTSxrQkFBa0IsQ0FBQztBQUN6QyxPQUFPLFdBQVcsTUFBTSxvQkFBb0IsQ0FBQztBQUM3QyxPQUFPLFlBQVksTUFBTSxxQkFBcUIsQ0FBQztBQUMvQyxPQUFPLGVBQWUsTUFBTSx3QkFBd0IsQ0FBQztBQUNyRCxPQUFPLGdCQUFnQixNQUFNLHlCQUF5QixDQUFDO0FBQ3ZELE9BQU8sSUFBSSxNQUFNLFlBQVksQ0FBQztBQUM5QixPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFFM0MsT0FBTyxFQUFDLFVBQVUsRUFBa0IsR0FBRyxFQUFFLElBQUksRUFBQyxNQUFNLEtBQUssQ0FBQztBQUMxRCxPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDbEQsT0FBTyxFQUFDLG1DQUFtQyxFQUFDLE1BQU0s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