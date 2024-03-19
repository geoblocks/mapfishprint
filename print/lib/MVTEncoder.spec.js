/* global test, expect */
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
import MVTEncoder, { PoolDownloader } from './MVTEncoder';
import VectorTileLayer from 'ol/layer/VectorTile.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import fs from 'fs';
import pixelmatch from 'pixelmatch';
import png from 'pngjs';
import { Buffer } from 'node:buffer';
import { MVT } from 'ol/format.js';
import { fromLonLat } from 'ol/proj.js';
import { mockFetch } from './__mocks__/PoolDownloader';
PoolDownloader.prototype.fetch = mockFetch;
var tolerance = 0.005;
function parsePNGFromFile(filepath) {
    return new Promise(function (resolve, reject) {
        var stream = fs.createReadStream(filepath);
        stream.on('error', function (err) {
            // @ts-ignore 2339
            if (err.code === 'ENOENT') {
                return reject(new Error("File not found: ".concat(filepath)));
            }
            reject(err);
        });
        var image = stream.pipe(new png.PNG());
        image.on('parsed', function () { return resolve(image); });
        image.on('error', reject);
    });
}
function parsePNGFromDataURL(filename, dataURL) {
    if (!dataURL.startsWith('data:image/png;base64,')) {
        throw new Error('Bad dataURL: ' + dataURL);
    }
    var data = dataURL.substring('data:image/png;base64,'.length);
    return new Promise(function (resolve, reject) {
        var buffer = Buffer.from(data, 'base64');
        new png.PNG().parse(buffer, function (error, data) {
            fs.writeFileSync(filename, buffer);
            if (error) {
                reject(error);
            }
            else {
                resolve(data);
            }
        });
    });
}
function parsePNG(filename, dataUrl) {
    return dataUrl
        ? parsePNGFromDataURL(filename, dataUrl)
        : parsePNGFromFile(filename);
}
function checkImages(prefix, actual, expected) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, actualImage, expectedImage, width, height, count;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        parsePNG("test_results/".concat(prefix, "_actual.png"), actual),
                        parsePNG("test_results/".concat(prefix, "_expected.png"), expected),
                    ])];
                case 1:
                    _a = _b.sent(), actualImage = _a[0], expectedImage = _a[1];
                    width = expectedImage.width;
                    height = expectedImage.height;
                    if (actualImage.width != width) {
                        throw new Error("Unexpected width for ".concat(actual, ": expected ").concat(width, ", got ").concat(actualImage.width));
                    }
                    if (actualImage.height != height) {
                        throw new Error("Unexpected height for ".concat(actual, ": expected ").concat(height, ", got ").concat(actualImage.height));
                    }
                    count = pixelmatch(actualImage.data, expectedImage.data, null, width, height);
                    return [2 /*return*/, count / (width * height)];
            }
        });
    });
}
// Resolutions are not round numbers
var r10 = 9.554628535647032;
var r20 = 19.109257071294063;
test('encodeMVTLayer with immediate API', function () { return __awaiter(void 0, void 0, void 0, function () {
    var encoder, mvtLayer, printExtent, results, expected, value, results2, expected2, value2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                encoder = new MVTEncoder();
                mvtLayer = new VectorTileLayer({
                    source: new VectorTileSource({
                        format: new MVT(),
                        url: '/tiles/{z}/{x}/{y}.pbf',
                        maxZoom: 14,
                    }),
                });
                printExtent = __spreadArray(__spreadArray([], fromLonLat([6.57119, 46.51325]), true), fromLonLat([6.57312, 46.51397]), true);
                MVTEncoder.useImmediateAPI = true;
                return [4 /*yield*/, encoder.encodeMVTLayer({
                        layer: mvtLayer,
                        canvasSize: [56, 30],
                        styleResolution: r10,
                        tileResolution: r10,
                        printExtent: printExtent,
                    })];
            case 1:
                results = _a.sent();
                expected = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAeCAYAAAB5c901AAAABmJLR0QA/wD/AP+gvaeTAAAEBklEQVRYhe2WTUxcVRiG3+/cOz/g/IGRMtPSH2zRiIowwCBJ7ZBIiImNC1PThTXBNJKmtWtNXODSuBO1gFGqiT+pqZrgD7Y1ZUGFDjPQmLCoErQ1wFBnhjIzBe6duedzUVHShKjhXmYWfbfn5H3uk5NzvksoUBr6Y88R84Bd0atGj7amrOIIq4r/LZ659BcAkrq0v2glp2CCw91teQb1gnHi0JkzilWcggkCAIH7AWz7NbXnaasYBRWMdTUmCPwpg05axSioIABAogeEtqb+SK0V9QUXjB5rmgRjxGDlZSv6Cy4IACD0EPhI89uX7zW7uigE3fOZLwEkDbvSaXZ3UQhaOTKKQhD4Z2TMLFYfNLO3aARjXY0JBn0ChqmPTdEIAoBCRg8IbY2nxh82q7OoBMdfar4CxgiEeadIZhX91zzw/ojblXc+xCwrAAUMSmR0fWr6ZEsaAIJ90UMATis5Y2fkRCi5Wd6WCja8G9tPCj9jU2i3x66qRKC0ZuRzhnFdCjE4MTs4HMYBkfG7ZxjUM9EVfHOzTMv+4u9MU2/kCRJ49f6y0pqGgCfRUFma2FdektnmcgoCHrm5kg8FPPvmf8y0zvjdcUVAdsx9/d5Hm+VuyQmG3hrzGE7ls71lJd4XHvNfeLK6fM4mwGvrF3+7WfnBxHz7z6llPaeIw5Od9Ynw6WHHcGfb6mbZW/LI6KrSrJIIPl/n/6Fjb/nsejkAaNvtix8Nbj9nI3qU9HwLXgeZIQdskaAQ1OItUf/Yv9MdXwMu56Qtm5P2tT0HdnkWfCW2BUFKKOiPmXZ1tmZMCJS57GpWCIUB4JfkcsXAZPz42akbz67fVmoTWQA+M9GqmWUbhfOcTGv5sm+vJsPxW1pjVjeqnaoyFw74Pl+/L6sbHganYvMZ3qjr/8ZSwfDARWda87QLIdvTK7maifl04MGKeyItVd6zzQH39Pq9Q9OpwJKWryDiUSAszfoG8wW7WQT9sVYCH8nodJiIbVKKIQKPTadW1VCVb6y+0n1d4vb9kAC+n05t//BKvCNnICIcMoJuMk3w7zFR+86Uy2FfrVdYOgwINzGrALwMEsRcxkQKEXsA2IjZxUROMEoAlDLIQcwuEGwAqgCUg3AOjI8BfBXralwO9kVDBLyyw+vcscvjuFbpsS8KEryQ1X3XFlf2/J7WFvKENyZmBy+hu9s8wWBv9DUibmfQ4wBsAAwAaQA5AFkAqwBWwFhmIo3A2b/WlggsmWgREhLAEoAcgRM624d+OlZ3405Y3anxZkWIp+yCa1wO1QkQbmmGpkljRkh8F134ZtRMuduCfdEYCOelFOe9jqVLZs2fjRLsi5YapNRA5u9jg0ghSmrsvDp1vDZrJfdu7qZI8yfio49mmBhiyAAAAABJRU5ErkJggg==';
                return [4 /*yield*/, checkImages('mvt_imm1', results[0].baseURL, expected)];
            case 2:
                value = _a.sent();
                expect(value).toBeLessThanOrEqual(tolerance);
                expect(results.map(function (r) { return r.extent; })).toStrictEqual([
                    [731501.5247058513, 5862982.857784151, 731716.3713230825, 5863099.32407374],
                ]);
                MVTEncoder.useImmediateAPI = true;
                return [4 /*yield*/, encoder.encodeMVTLayer({
                        layer: mvtLayer,
                        canvasSize: [28, 15],
                        styleResolution: r20,
                        tileResolution: r20,
                        printExtent: printExtent,
                    })];
            case 3:
                results2 = _a.sent();
                expected2 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAPCAYAAAD3T6+hAAAABmJLR0QA/wD/AP+gvaeTAAACoElEQVQ4jb2TS0hUURjH/985984dZ3LuVXyng9k7wUdOWgSKhT02UpSzrU25kBaBEbRq0a6oXaTRUooJgllGi5TBonSssKmBsgeamY466jjO495zWoQg0cAk1tl+3/f7cc75f4R1ng6fj3+ar/ooQbdHOhuuZzvH1it86PVaIPQSZFeHz8f/uRAAIHEXQNFYdGv7fxEGOz0RCbpPUl7Idob+VlLVM6wbgvaDoYGkcEkhGHHWbZFsen2+cWhDhbU9w0cUQrfK2I48jc/ZFZZYSFmupaTYJqT4DOBksNMT3hBhY2/wKCAv7ypwytN7Cp/Xlm6aYYA0BVjf6FRb4OvCsfl48oHJ+LWRcw3vM3GySlfdrVcGVHFpd6HTdaa+ZOBwVf5kvl1JuzTFNOxK2lPmGns7HWuJpWR5PGV9qTx0NjTx+J75J1ZWoeEOq15TWElNifNDs9v4oTLItXWHysyWSsOf71BXVI6aFQcrz8TKSiiJylw2Louc2tKq7MXEwnZ/ONK62tO+syBQrtteaio3CDY9E0vJSmgJRkQyJYXmD0dax+YTzQlLlBQ61CCAp6t9HCQIRJKlM2ZDAYADN5/lrOTkFHNmccnIICEVRjJXSNIAOCBEbTRp1ryZXGxz6/bl8lxt8KBbD7h1+9xaWCRhGom0+MbSViyjcG9PcDAF2cRhcQAg8et7hCQAWARgSc4W06bgsaQItW7RfZ5SPfI7yP9+1v19KVlhCutJEq7xjEIiGWAQV2DSuKnxhJlUVkQBXw55q1NrHpU8d4ZPhWfj3b3B6WarHgP7NuuzDIAA8OjdTGXf6PTxmVgqDIH+UFd1xhtmvYfVV0M2rXj5hKrwi3aFVeTnKFMOG49H42ZeNGkVpYXol5LdGDLqRuAlKxPnJ0rfEEKyDlHnAAAAAElFTkSuQmCC';
                return [4 /*yield*/, checkImages('mvt_imm2', results2[0].baseURL, expected2)];
            case 4:
                value2 = _a.sent();
                expect(value2).toBeLessThanOrEqual(tolerance);
                expect(results2.map(function (r) { return r.extent; })).toStrictEqual([
                    [731501.5247058513, 5862982.857784151, 731716.3713230825, 5863099.32407374],
                ]);
                return [2 /*return*/];
        }
    });
}); });
test('encodeMVTLayer with render API', function () { return __awaiter(void 0, void 0, void 0, function () {
    var encoder, mvtLayer, printExtent, results, expected, value, results2, expected2, value2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                encoder = new MVTEncoder();
                mvtLayer = new VectorTileLayer({
                    source: new VectorTileSource({
                        format: new MVT(),
                        url: '/tiles/{z}/{x}/{y}.pbf',
                        maxZoom: 14,
                    }),
                });
                printExtent = __spreadArray(__spreadArray([], fromLonLat([6.57119, 46.51325]), true), fromLonLat([6.57312, 46.51397]), true);
                MVTEncoder.useImmediateAPI = false;
                return [4 /*yield*/, encoder.encodeMVTLayer({
                        layer: mvtLayer,
                        canvasSize: [56, 30],
                        styleResolution: r10,
                        tileResolution: r10,
                        printExtent: printExtent,
                    })];
            case 1:
                results = _a.sent();
                expected = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAeCAYAAAB5c901AAAABmJLR0QA/wD/AP+gvaeTAAADlklEQVRYhe2XS2xUZRTHf+feeVX7sBgo1rYJjSGaYgztzFC6ahfoRuODAD5CDMa0QdAEN0YgiIkribqoje0kptVESaoUY1wYWNgFz+kdMZoGIohNLdBiZ0gf1mEe33EhSjWoNb3zWPS/u+ee/P/3l/PlO7lCgdQYiW0W1V6fnao9+XxLIlc5Vq6M/0vll6cHgHjK+J7LZU7BAAf3t2UU6UbZuam/385VTsEAAQSNAFU/JlY9nKuMggLGOoKTgh5U5KVcZRQUEABDJ0JbKBJtyIV9wQGd7aEzKMeyar+YC/+CAwIgdAq6Nfzu6Tvdti4KwLIrM4eBeNZnb3PbuygAc7kyigIQbq6Mi9fqH3HTt2gAYx3BSUU+RnH1sikaQABbsp0IbcH3hta45VlUgEPt4W9QjmG5N0Vxy2ihWvv+19VW2mwE7r1ROofwaawjeAWgqcfZBPTZ6WxddOe6+GLz8jrBxp7YbjtjRgJee099ZSC0alkgHPDae0QYaYo4r8LNlZHxelz5y/C4YbIQhSLOXkF3b25Y/sGuljrHAgUwIO+cGA32D/+8LxRx7MH24BuNPbFOC/MQcGCxuXk5oqGuaK16rQtPr6nq27W+JnarnrdPjQUPfjfxrKTNPUMvhMZa+wb9g9vakovNzssRNR7r8RKPlfgnOICXm2ucEo+VMLb1GCLqBhzkCVDQ1VWlvrH5tbm08c6mjW9+bcXt/ksqstrN7PxMEEt13vP5+NyK3jPjOw4NX934906Rv7QuWnm5ZET1+4nZ1JbPzyVaR6bm1s2msvUBj325tfqOT+b3TfySqcFw3s3snAK29n4VmL5evgFLH0xmzPIjF+OPhu8uP9VcW3EoXF12YX7vgeOjoWQmW+mxM4fd/Ab3Afer1XRXrEXQrTMpeVJEvShfINaH0UszW2rKAyNP3V/1wx/taYO8deKn8MDZyWdEee10e/PYv9n/X/25Jhq6hkv9vuRaW40/i1Umqh6gQhFLVCtVxBbRcsArqqUqEkApAW5TxC+qpQheoBZYhnAE5SPgs1hHcA6gqdt5BZHXAx6ZWlnmGwUYn0nVJTNaIZh9TkfoTTfhAKSp29krohsUWQ94gSwwDaSBWSAJ/IoypyLXBZ298W5KUKMi1zAYYApICzqZUt+X325/4OqtAkNd0ZXGaz2hKvcBiOhZK20GhnaEx92G+x2wx4khHDXGOlrhnzru1v5Z0pKWtCD9BlnCWOFgJziOAAAAAElFTkSuQmCC';
                return [4 /*yield*/, checkImages('mvt_rend1', results[0].baseURL, expected)];
            case 2:
                value = _a.sent();
                expect(value).toBeLessThanOrEqual(tolerance);
                expect(results.map(function (r) { return r.extent; })).toStrictEqual([
                    [731501.5247058513, 5862982.857784151, 731716.3713230825, 5863099.32407374],
                ]);
                MVTEncoder.useImmediateAPI = false;
                return [4 /*yield*/, encoder.encodeMVTLayer({
                        layer: mvtLayer,
                        canvasSize: [28, 15],
                        styleResolution: r20,
                        tileResolution: r20,
                        printExtent: printExtent,
                    })];
            case 3:
                results2 = _a.sent();
                expected2 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAPCAYAAAD3T6+hAAAABmJLR0QA/wD/AP+gvaeTAAACU0lEQVQ4jb2UT0jTYRjHv8/7+/3cnxTtj05kjkoawTqUNk2DIjp0iSjCHepsO0iEdKjWH+0SlNStSCvoEsGipFuedrAJ2rZDEAlOQZ2YINO1ZD+33+99OqxgiG3TqOf2Pu/zfD7vC8/7ErYYncGgMr28N86gJzF/S3+5fWKrwjc+nwnCIIG7O4NB5Z8LAQCMZwDqplaazvwXYdR/eIlBr4n5crk9tFnJoRexBpGT5wHs/5VKgXCdBR2MdbV8LtWvbkbWPBANCEP2WTQl2VCpzTKBFtK5xjXTBEs8B9BailH2Db2DkVsEBHye2lc9Ha6IABgAJEB9oenO4fjySRDfG+/y3vxroffxeCNrIn7hgONlT7szun5fSogrw5P9Y4mUDTne86m7de5PrLKGRqrinE0VyY1kACAE5KmmHUNWVdGlIs4WY5UlJLDbUVmRKMyNJVL73k8snfi9Pu3e+bFum2WCidzFWGUNjYRgBpDM5OwjM6m2qWX9mG7K+lq7FgUQKqwkYi4pbH80asvYbA5FmAoLqiHJqiCukkwWAHYCahZ/ZD0D0YX7qkDGWWUJH3VVj7iqrclC2OKq4YTEZFFh80A0nAW3KTAVACCZP6BkAoDvAEwGp3WDLZmcEbp9fPdbTQhzPag/POvVDXO7qhhDRYVEPCIgAzBozrAourGmZuQuZfWLz5MtLPQORm58iK/02rX5masdjeOayD+LnAQ9HJ1rffd16SIxescuHUlsrMrHpn6alqeRayC6a1UpVV9VMQsA39JZl25wNUHeifi9D0oxfgIpY+NN0lICtAAAAABJRU5ErkJggg==';
                return [4 /*yield*/, checkImages('mvt_rend2', results2[0].baseURL, expected2)];
            case 4:
                value2 = _a.sent();
                expect(value2).toBeLessThanOrEqual(tolerance);
                expect(results2.map(function (r) { return r.extent; })).toStrictEqual([
                    [731501.5247058513, 5862982.857784151, 731716.3713230825, 5863099.32407374],
                ]);
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTVZURW5jb2Rlci5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL01WVEVuY29kZXIuc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx5QkFBeUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFekIsT0FBTyxVQUFVLEVBQUUsRUFBQyxjQUFjLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDeEQsT0FBTyxlQUFlLE1BQU0sd0JBQXdCLENBQUM7QUFDckQsT0FBTyxnQkFBZ0IsTUFBTSx5QkFBeUIsQ0FBQztBQUN2RCxPQUFPLEVBQUUsTUFBTSxJQUFJLENBQUM7QUFDcEIsT0FBTyxVQUFVLE1BQU0sWUFBWSxDQUFDO0FBQ3BDLE9BQU8sR0FBRyxNQUFNLE9BQU8sQ0FBQztBQUN4QixPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBRW5DLE9BQU8sRUFBQyxHQUFHLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDakMsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUN0QyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFFckQsY0FBYyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO0FBRTNDLElBQU0sU0FBUyxHQUFHLEtBQUssQ0FBQztBQUV4QixTQUFTLGdCQUFnQixDQUFDLFFBQWdCO0lBQ3hDLE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTTtRQUNqQyxJQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDN0MsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBQyxHQUFHO1lBQ3JCLGtCQUFrQjtZQUNsQixJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFLENBQUM7Z0JBQzFCLE9BQU8sTUFBTSxDQUFDLElBQUksS0FB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