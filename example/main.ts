import { Plane, PlaneHelper, Vector3 } from 'three';
import { PointCloudOctree } from '../src';
import { PointOpacityType, PointShape, PointSizeType, PointColorType } from '../src/materials/enums';
import { Viewer } from './viewer';
import { gsToPath } from '../src/utils/utils';

const JSON5 = require('json5');

// @ts-ignore
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';

require('./main.css');

let gui: GUI;

enum DemoPotree {
  LION = 0,
  YBF = 1,
}

const parameters = {
  budget: 1e5,
  'points size': 1,
  'clipping plane': 0,
  shape: PointShape.SQUARE,
  pointSizeType: PointSizeType.FIXED,
  pointColorType: PointColorType.RGB,
  pointOpacityType: PointOpacityType.FIXED,
  demoPotree: DemoPotree.YBF
};

const targetEl = document.createElement('div');
targetEl.className = 'container';
document.body.appendChild(targetEl);

const viewer = new Viewer();
viewer.initialize(targetEl);


const clippingPlane = new Plane()
const planeHelper = new PlaneHelper(clippingPlane, 5, 0xffc919);
viewer.scene.add(planeHelper);

let pointCloud: PointCloudOctree | undefined;

// {
//   "scanUuid": "S0P",
//   "pose": {
//       "x": [
//           0.9997667104163336, -0.013713407219035877, -0.016687336660558143, 0.013652923572695687,
//           0.9998998259139193, -0.0037330704298906663, 0.016736858136939665, 0.003504368610932413,
//           0.9998537878008779, 7.816186276445997, 1.3532286550652184, 3.6232562903889876
//       ]
//   },
//   "potreeStructureJsonPath": "gs://resonai-irocket-public/snap-rotem-colin-1636635879596169843-20211111145032/potree_structure_files/S0P/r.json",
//   "maxSubTreeDepth": 0,
//   "potreeLocationsJsonPath": "gs://resonai-irocket-public/snap-rotem-colin-1636635879596169843-20211111145032/potree_ybf/S0P/loc.json"
// }

const onPCOLoad = (pco: PointCloudOctree) => {
  pointCloud = pco;
  pointCloud.potree.pointBudget = parameters.budget;
  pointCloud.rotateX(-Math.PI / 2);
  pointCloud.material.size = parameters['points size'];
  pointCloud.material.pointOpacityType = parameters.pointOpacityType;
  pointCloud.material.shape = parameters.shape;
  pointCloud.material.pointSizeType = parameters.pointSizeType;
  pointCloud.material.pointColorType = parameters.pointColorType;
  pointCloud.material.clippingPlanes = [clippingPlane];

  const camera = viewer.camera;
  camera.far = 1000;
  camera.updateProjectionMatrix();
  camera.position.set(0, 0, 10);
  camera.lookAt(new Vector3());

  viewer.add(pco);
}

const jsonFile = 'gs://resonai-irocket-public/snap-rotem-colin-1636635879596169843-20211111145032/potree_structure_files/S0P/r.json'
/*
Resonai: {
  "nodes": [3221225552, 4278190152, 4278190351, 251658343, 234881116, 201326627, 794, 767, 3758096405, 908, 571, 2936013011, 251658411, 2348810355, 201326671, 4076863688, 4076863673, 3422552178, 3422552147, 285212695, 50331713, 1426063512, 2919235620, 855638153, 587202649, 1560281158, 1157628004, 167, 805306397, 805306395, 3758096412, 50331695, 184549459, 855638189, 838860873, 4278190278, 4093640883, 855638160, 570425421, 4227858685, 2852126954, 134217732, 3422552276, 3422552299, 3422552298, 2281701485, 822083693, 570425366, 4278190351, 3472883922, 1342177307, 3758096406, 822083670, 570425415, 3472883991, 2852126953, 4026531917, 2684354580, 3422552275, 3422552281, 1073741856, 3221225513, 3422552298, 2281701477, 3221225531, 2147483655, 119, 877, 1548, 766, 2123, 3459, 2566, 2085, 44, 98, 142, 1272, 463, 15, 4219, 4074, 6743, 146, 7781, 10549, 5793, 6125, 634, 7648, 174, 1936, 7924, 1980, 709, 904, 1563, 2523, 1665, 1169, 276, 16307, 3548, 22801, 21679, 118, 11172, 35132, 23250, 43133, 38369, 71361, 636, 21397, 42777, 22287, 43364, 16213, 9935, 17390, 9145, 70812, 137506, 70822, 135239, 2042, 151832, 471408, 32531, 116148, 161556, 236395, 247088, 380085, 261428, 351794, 470649, 220596, 233165, 223807, 826579, 578385, 1418, 49578, 59764, 60222, 37216, 110277, 217029, 74652, 184174, 402860, 563126, 529283, 1245634, 249069, 808998, 15166, 61569, 9774, 3345, 238, 20176, 43303, 20483, 44462, 42009, 30911, 50634, 41354, 6527, 32964, 39241, 150855, 14052, 120522, 12533, 23511, 3350, 336, 1305, 4877, 6953, 393556, 179798, 266573, 580888, 440787, 321537, 315233, 162657, 44391, 1079158, 885694, 400119, 424469, 50806, 55606, 70545, 53085, 20526, 39865, 46277, 52336, 32482, 61703, 78138, 198025, 79841, 176371, 11536, 16429, 19154, 625338, 2188087, 375653, 584726, 1038881, 346161, 49411, 68964, 17929],
  "min_bounding_box": [-3.1325066089630127, -2.374156951904297, -10.19989013671875],
  "scale": 12.044363021850586
}
potree: {
	"version": "1.7",
	"octreeDir": "data",
	"boundingBox": {
		"lx": -0.748212993144989,
		"ly": -2.78040599822998,
		"lz": 2.54782128334045,
		"ux": 3.89967638254166,
		"uy": 1.86748337745667,
		"uz": 7.1957106590271
	},
	"tightBoundingBox": {
		"lx": -0.748212993144989,
		"ly": -2.78040599822998,
		"lz": 2.55100011825562,
		"ux": 2.4497377872467,
		"uy": 1.48934376239777,
		"uz": 7.1957106590271
	},
	"pointAttributes": [
		"POSITION_CARTESIAN",
		"COLOR_PACKED",
		"NORMAL_SPHEREMAPPED"
	],
	"spacing": 0.0750000029802322,
	"scale": 0.001,
	"hierarchyStepSize": 6
}
*/
const locJSON = 'gs://resonai-irocket-public/snap-rotem-colin-1636635879596169843-20211111145032/potree_ybf/S0P/loc.json'
/*
{
  "paths_map": ["null", "gs://resonai-irocket-public/snap-rotem-colin-1636635879596169843-20211111145032/potree_ybf/S0P"],
  "node_locations": [2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 2, 2, 2, 2, 1, 2, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
}
*/
// (3221225552 & 2**31) // get MSB

const loadLion = () => {
  viewer.load('cloud.js',
              'https://raw.githubusercontent.com/potree/potree/develop/pointclouds/lion_takanawa/')
    .then(onPCOLoad)
    .catch(err => console.error(err));
}

const loadYBF = () => {
  fetch(gsToPath(locJSON)).then(res => {
    res.text().then(text => {
      viewer.loadResonaiPotree(jsonFile, JSON5.parse(text))
        .then(onPCOLoad)
        .catch(err => console.error(err));
    })
  })
}

switch (parameters.demoPotree) {
  case DemoPotree.LION:
    loadLion();
    break;
  case DemoPotree.YBF:
    loadYBF();
    break;
}
initGui();

function initGui() {
  gui = new GUI();

  const loadOptions = Object.fromEntries(Object.entries(DemoPotree).filter(([_, v]) => typeof v !== 'string'))
  gui.add(parameters, 'demoPotree', loadOptions).onChange(function (val: DemoPotree) {
    viewer.unload();
    switch (DemoPotree[val]) {
      case DemoPotree[DemoPotree.LION]:
        loadLion();
        break;
      case DemoPotree[DemoPotree.YBF]:
        loadYBF();
        break;
    }
  });

  gui.add(parameters, 'budget', 1e3, 1e6).onChange(function (val: number) {
    if (pointCloud) {
      pointCloud.potree.pointBudget = val;
    }
  });

  gui.add(parameters, 'points size', 1, 10).onChange(function (val: number) {
    if (pointCloud) {
      pointCloud.material.size = val;
    }
  });

  gui.add(parameters, 'clipping plane', -1, 2.5, 0.1).onChange(function (val: number) {
    clippingPlane.constant = -val;
  });

  const pointOpacityTypeDict = Object.fromEntries(Object.entries(PointOpacityType).filter(([_, v]) => typeof v !== 'string'))
  gui.add(parameters, 'pointOpacityType', pointOpacityTypeDict).onChange(function (val: PointOpacityType) {
    if (pointCloud) {
      pointCloud.material.pointOpacityType = val;
    }
  });
  const shapeDict = Object.fromEntries(Object.entries(PointShape).filter(([_, v]) => typeof v !== 'string'))
  gui.add(parameters, 'shape', shapeDict).onChange(function (val: PointShape) {
    if (pointCloud) {
      pointCloud.material.shape = val;
    }
  });
  const pointSizeTypeDict = Object.fromEntries(Object.entries(PointSizeType).filter(([_, v]) => typeof v !== 'string'))
  gui.add(parameters, 'pointSizeType', pointSizeTypeDict).onChange(function (val: PointSizeType) {
    if (pointCloud) {
      pointCloud.material.pointSizeType = val;
    }
  });
  const pointColorTypeDict = Object.fromEntries(Object.entries(PointColorType).filter(([_, v]) => typeof v !== 'string'))
  gui.add(parameters, 'pointColorType', pointColorTypeDict).onChange(function (val: PointColorType) {
    if (pointCloud) {
      pointCloud.material.pointColorType = val;
    }
  });
}