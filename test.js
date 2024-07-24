import test from 'node:test';
import assert from 'node:assert';
import Map from 'ol/Map.js';
import {MFPEncoder, BaseCustomizer} from './lib/index.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import {View} from 'ol';
import {Polygon, LineString, Point, Circle} from 'ol/geom.js';
import {fromLonLat} from 'ol/proj.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import Feature from './demo/ol/Feature.js';
import {Fill, Stroke, Style, Text} from 'ol/style.js';
import {Constants} from './lib/constants.js';

const MFP_URL = 'https://geomapfish-demo-2-8.camptocamp.com/printproxy';

const getEmptyMap = () => {
  return new Map({
    target: 'map',
    view: new View({
      center: fromLonLat([7.1560911, 46.3521411]),
      zoom: 12,
    }),
  });
};

const getDefaultOptions = (map, customizer) => {
  return {
    map,
    scale: 1,
    printResolution: map.getView().getResolution(),
    dpi: 300,
    customizer,
  };
};

const fPolygon = new Feature({
  name: 'A polygon',
  geometry: new Polygon([
    [
      [796612, 5837460],
      [796812, 5837460],
      [796812, 5837260],
      [796612, 5837260],
      [796612, 5837460],
    ],
  ]),
});

const fCircle = new Feature({
  name: 'A circle',
  geometry: new Circle([796612, 5836960], 10),
});

const fLine = new Feature({
  name: 'A line',
  geometry: new LineString([
    [796712, 5836960],
    [796712, 5836760],
    [796812, 5836760],
  ]),
});

const fPoint = new Feature({
  name: 'A point',
  geometry: new Point([796612, 5836960]),
});

const fill = new Fill({color: 'rgba(100, 100, 100, 0.5)'});
const stroke = new Stroke({
  color: '#002288',
  width: 1.25,
});
const styleFn = (feature) => {
  return new Style({
    fill,
    stroke,
    text: new Text({
      text: feature.get('name'),
      font: '12px sans-serif',
      offsetY: -12,
    }),
    image: new Circle({
      fill,
      stroke: stroke,
      radius: 5,
    }),
  });
};

test('Empty map', async (t) => {
  const encoder = new MFPEncoder('./mfp_server_url');
  const customizer = new BaseCustomizer([0, 0, 1000, 1000]);
  const map = getEmptyMap();
  map.getView();
  const spec = await encoder.encodeMap(getDefaultOptions(map, customizer));
  assert.deepEqual(spec, {
    center: [796612.417322277, 5836960.776101627],
    dpi: 300,
    layers: [],
    projection: 'EPSG:3857',
    rotation: 0,
    scale: 1,
  });
});

test('OSM map', async (t) => {
  const map = getEmptyMap();
  map.addLayer(new TileLayer({source: new OSM()}));
  class MyMfpBaseEncoder extends MFPEncoder {}
  const encoder = new MyMfpBaseEncoder(MFP_URL);
  const customizer = new BaseCustomizer([0, 0, 10000, 10000]);
  const spec = await encoder.encodeMap(getDefaultOptions(map, customizer));

  assert.deepEqual(spec, {
    center: [796612.417322277, 5836960.776101627],
    dpi: 300,
    layers: [
      {
        baseURL: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        name: undefined,
        opacity: 1,
        type: 'osm',
      },
    ],
    projection: 'EPSG:3857',
    rotation: 0,
    scale: 1,
  });
});

test('Vector features', async (t) => {
  Constants.CIRCLE_TO_POLYGON_SIDES = 8; // limit circle to 9 coordinates
  const map = getEmptyMap();
  const encoder = new MFPEncoder('./mfp_server_url');
  const customizer = new BaseCustomizer([0, 0, Infinity, Infinity]);
  const features = [fPolygon, fCircle, fLine, fPoint];
  features.forEach((feature) => feature.setStyle(styleFn));
  map.getView();
  map.addLayer(
    new VectorLayer({
      source: new VectorSource({
        features,
      }),
    }),
  );
  const spec = await encoder.encodeMap(getDefaultOptions(map, customizer));
  assert.deepEqual(spec.center, [796612.417322277, 5836960.776101627]);
  assert(spec.dpi === 300);
  assert(spec.projection === 'EPSG:3857');
  assert(spec.rotation === 0);
  assert(spec.scale === 1);
  assert(spec.layers.length === 1);
  assert(spec.layers[0].geoJson.features.length === 4);
  assert.deepEqual(spec.layers[0].geoJson.features[0], {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [796612, 5837460],
          [796812, 5837460],
          [796812, 5837260],
          [796612, 5837260],
          [796612, 5837460],
        ],
      ],
    },
    properties: {
      name: 'A polygon',
      _mfp_style: '1',
    },
  });

  assert.deepEqual(spec.layers[0].geoJson.features[1], {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [796622, 5836960],
          [796619.0710678119, 5836967.071067812],
          [796612, 5836970],
          [796604.9289321881, 5836967.071067812],
          [796602, 5836960],
          [796604.9289321881, 5836952.928932188],
          [796612, 5836950],
          [796619.0710678119, 5836952.928932188],
          [796622, 5836960],
        ],
      ],
    },
    properties: {
      name: 'A circle',
      _mfp_style: '2',
    },
  });
  assert.deepEqual(spec.layers[0].geoJson.features[2], {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [
        [796712, 5836960],
        [796712, 5836760],
        [796812, 5836760],
      ],
    },
    properties: {
      name: 'A line',
      _mfp_style: '3',
    },
  });

  assert.deepEqual(spec.layers[0].geoJson.features[3], {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [796612, 5836960],
    },
    properties: {
      name: 'A point',
      _mfp_style: '4',
    },
  });
  assert(spec.layers[0].name === undefined);
  assert(spec.layers[0].opacity === 1);
  assert(spec.layers[0].type === 'geojson');
  assert.deepEqual(spec.layers[0].style, {
    version: 2,
    "[_mfp_style = '1']": {
      symbolizers: [
        {
          type: 'polygon',
          fillColor: '#646464',
          fillOpacity: 0.5,
          strokeColor: '#002288',
          strokeOpacity: 1,
          strokeWidth: 1.25,
        },
        {
          type: 'text',
          label: 'A polygon',
          fontFamily: 'sans-serif',
          fontSize: '12px',
          fontStyle: 'normal',
          fontWeight: 'normal',
          labelXOffset: 0,
          labelYOffset: 12,
          labelAlign: 'cm',
          fillColor: '#333333',
          fillOpacity: 1,
          fontColor: '#333333',
        },
      ],
    },
    "[_mfp_style = '2']": {
      symbolizers: [
        {
          type: 'polygon',
          fillColor: '#646464',
          fillOpacity: 0.5,
          strokeColor: '#002288',
          strokeOpacity: 1,
          strokeWidth: 1.25,
        },
        {
          type: 'text',
          label: 'A circle',
          fontFamily: 'sans-serif',
          fontSize: '12px',
          fontStyle: 'normal',
          fontWeight: 'normal',
          labelXOffset: 0,
          labelYOffset: 12,
          labelAlign: 'cm',
          fillColor: '#333333',
          fillOpacity: 1,
          fontColor: '#333333',
        },
      ],
    },
    "[_mfp_style = '3']": {
      symbolizers: [
        {
          type: 'line',
          strokeColor: '#002288',
          strokeOpacity: 1,
          strokeWidth: 1.25,
        },
        {
          type: 'text',
          label: 'A line',
          fontFamily: 'sans-serif',
          fontSize: '12px',
          fontStyle: 'normal',
          fontWeight: 'normal',
          labelXOffset: 0,
          labelYOffset: 12,
          labelAlign: 'cm',
          fillColor: '#333333',
          fillOpacity: 1,
          fontColor: '#333333',
        },
      ],
    },
    "[_mfp_style = '4']": {
      symbolizers: [
        {
          type: 'text',
          label: 'A point',
          fontFamily: 'sans-serif',
          fontSize: '12px',
          fontStyle: 'normal',
          fontWeight: 'normal',
          labelXOffset: 0,
          labelYOffset: 12,
          labelAlign: 'cm',
          fillColor: '#333333',
          fillOpacity: 1,
          fontColor: '#333333',
        },
      ],
    },
  });
});
