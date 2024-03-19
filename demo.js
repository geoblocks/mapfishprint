import {Map, View} from 'ol';

import {
  MFPEncoder,
  BaseCustomizer,
  requestReport,
  getDownloadUrl,
  cancelPrint,
} from '@geoblocks/mapfishprint';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import {Circle, Fill, Stroke, Style, Text} from 'ol/style.js';
import Feature from './ol/Feature.js';
import {Polygon, LineString, Point} from 'ol/geom.js';
import {getPrintExtent} from './lib/utils.js';

const MFP_URL = 'https://geomapfish-demo-2-8.camptocamp.com/printproxy';
const layout = '1 A4 portrait'; // better take from MFP
const pageSize = [254, 675]; // better take from MFP
const getStyleFn = (fillColor) => {
  const fill = new Fill({color: fillColor});
  const stroke = new Stroke({
    color: '#002288',
    width: 1.25,
  });
  return (feature) => {
    return new Style({
      fill,
      stroke,
      text: new Text({
        text: feature.get('name'),
        font: '12px sans-serif',
        offsetY: 12,
      }),
      image: new Circle({
        fill,
        stroke: stroke,
        radius: 5,
      }),
    });
  };
};
const vectorLayer = new VectorLayer({
  source: new VectorSource(),
  style: getStyleFn('rgba(255, 0, 255, 0.4)'),
});
const features = [
  new Feature({
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
  }),
  new Feature({
    name: 'A line',
    geometry: new LineString([
      [796712, 5836960],
      [796712, 5836760],
      [796812, 5836760],
    ]),
  }),
  new Feature({
    name: 'A point',
    geometry: new Point([796612, 5836960]),
  }),
];
features[0].setStyle(getStyleFn('rgba(255,155,50,0.4)'));
features[1].setStyle(getStyleFn('rgba(0,0,0,0.4)'));
// Features 0 and 1 use dedicated style. Feature 2 uses layer style.
vectorLayer.getSource().addFeatures(features);

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    vectorLayer,
  ],
  view: new View({
    center: [796612, 5836960],
    zoom: 12,
  }),
});

let report = null;

document.querySelector('#cancel').addEventListener('click', async () => {
  const resultEl = document.querySelector('#result');
  if (report) {
    const cancelResult = await cancelPrint(MFP_URL, report.ref);
    if (cancelResult.status === 200) {
      resultEl.innerHTML = 'Print is canceled';
    } else {
      resultEl.innerHTML = 'Failed to cancel print';
    }
  } else {
    resultEl.innerHTML = 'No print in progress';
  }
});

document.querySelector('#print').addEventListener('click', async () => {
  const specEl = document.querySelector('#spec');
  const reportEl = document.querySelector('#report');
  const resultEl = document.querySelector('#result');
  specEl.innerHTML = reportEl.innerHTML = resultEl.innerHTML = '';
  const encoder = new MFPEncoder(MFP_URL);
  const scale = 10000;
  const center = map.getView().getCenter();
  const customizer = new BaseCustomizer(getPrintExtent(pageSize, center, scale));
  /**
   * @type {MFPMap}
   */
  const mapSpec = await encoder.encodeMap({
    map,
    scale: 10000,
    printResolution: map.getView().getResolution(),
    dpi: 254,
    customizer: customizer,
  });

  /**
   * @type {MFPSpec}
   */
  const spec = {
    attributes: {
      map: mapSpec,
      datasource: [],
    },
    format: 'pdf',
    layout: layout,
  };

  // This is just a quick demo
  // Note that using innerHTML is not a good idea in production code...

  console.log('spec', spec);
  specEl.innerHTML = JSON.stringify(spec, null, '  ');

  report = await requestReport(MFP_URL, spec);
  console.log('report', report);
  reportEl.innerHTML = JSON.stringify(report, null, '  ');

  await getDownloadUrl(MFP_URL, report, 1000)
    .then(
      (url) => {
        resultEl.innerHTML = url;
        document.location = url;
        return url;
      },
      (error) => {
        console.log('result', 'error', error);
        resultEl.innerHTML = error;
        return error;
      },
    )
    .finally(() => {
      report = null;
    });
});
