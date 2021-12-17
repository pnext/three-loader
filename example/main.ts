import { Plane, PlaneHelper, Vector3 } from 'three';
import { PointCloudOctree } from '../src';
import { PointCloudOctreeGeometryNode } from '../src/point-cloud-octree-geometry-node';
import { PointOpacityType, PointShape, PointSizeType, PointColorType } from '../src/materials/enums';
import { Viewer } from './viewer';
import { gsToPath } from '../src/utils/utils';
// import { Potree } from '../src/potree'
// @ts-ignore

const JSON5 = require('json5');

// @ts-ignore
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';

require('./main.css');

let gui: GUI;

enum DemoPotree {
  LION = 0,
  YBF = 1,
  RESONAI_POTREE = 2
}

const parameters = {
  budget: 1e8,
  'points size': 1,
  'clipping plane': 0,
  shape: PointShape.SQUARE,
  pointSizeType: PointSizeType.ADAPTIVE,
  pointColorType: PointColorType.RGB,
  pointOpacityType: PointOpacityType.FIXED,
  demoPotree: DemoPotree.RESONAI_POTREE
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
  // pointCloud.rotateX(-Math.PI / 2);
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

const jsonFile = 'gs://resonai-irocket-public/17555/potree_structure_files/S6P/r.json'

const locJSON = 'gs://resonai-irocket-public/17555/potree_ybf/S6P/loc.json'
/*
{
  "paths_map": ["null", "gs://resonai-irocket-public/snap-rotem-colin-1636635879596169843-20211111145032/potree_ybf/S0P"],
  "node_locations": [2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 2, 2, 2, 2, 1, 2, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
}
*/
// (3221225552 & 2**31) // get MSB

const loadLion = () => {
  // viewer.load('cloud.js',
  //             'https://raw.githubusercontent.com/potree/potree/develop/pointclouds/lion_takanawa/')
  //   .then(onPCOLoad)
  //   .catch(err => console.error(err));
}

const loadYBF = () => {
  const url = 'https://storage.googleapis.com/resonai-irocket-public/snap-master-colin-1605620427366522352-20201117134028/downsampled_ybf/H__Hamsa_015_2584c47f2cdf5b8a_50000.ybf'
  viewer.loadSingle(url).then(onPCOLoad)
}

const loadResonaiPotree = () => {
  const onLoad = (node: PointCloudOctreeGeometryNode) => {
    console.log('Loaded node!', node);
  }
  fetch(gsToPath(locJSON)).then(res => {
    res.text().then(text => {
      viewer.loadResonaiPotree(gsToPath(jsonFile), JSON5.parse(text), [onLoad])
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
  case DemoPotree.RESONAI_POTREE:
      loadResonaiPotree();
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
      case DemoPotree[DemoPotree.RESONAI_POTREE]:
        loadResonaiPotree();
        break;
    }
  });

  gui.add(parameters, 'budget', 1e3, 1e8).onChange(function (val: number) {
    if (pointCloud) {
      pointCloud.potree.pointBudget = val;
    }
  });

  gui.add(parameters, 'points size', 1, 10).onChange(function (val: number) {
    if (pointCloud) {
      pointCloud.material.size = val;
    }
  });

  gui.add(parameters, 'clipping plane', -30, 100, 0.1).onChange(function (val: number) {
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
