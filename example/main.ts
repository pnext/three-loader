import { Color, Plane, PlaneHelper, Vector3 } from 'three';
import { PointCloudOctree } from '../src';
import { IClipPolyhedron } from '../src/materials/clipping';
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
  budget: 1e7,
  maxLevel: 20,
  'points size': 1,
  'clipping plane': 0,
  shape: PointShape.SQUARE,
  highlightIgnoreDepth: false,
  pointSizeType: PointSizeType.ADAPTIVE,
  pointColorType: PointColorType.RGB,
  pointOpacityType: PointOpacityType.FIXED,
  demoPotree: DemoPotree.RESONAI_POTREE
};

const targetEl = document.createElement('div');
targetEl.className = 'container';
// targetEl.style.width = '400px';
// targetEl.style.height = '600px';
// targetEl.style.top = '200px';
// targetEl.style.left = '300px';
// targetEl.style.position = 'absolute';
document.body.appendChild(targetEl);

const viewer = new Viewer();
viewer.initialize(targetEl);


const clippingPlane = new Plane()
const planeHelper = new PlaneHelper(clippingPlane, 5, 0xffc919);
viewer.scene.add(planeHelper);

let pointCloud: PointCloudOctree | undefined;

const onPCOLoad = (pco: PointCloudOctree) => {
  pointCloud = pco;
  pointCloud.maxLevel = parameters.maxLevel;
  pointCloud.potree.pointBudget = parameters.budget;
  // pointCloud.rotateX(-Math.PI / 2);
  pointCloud.material.size = parameters['points size'];
  pointCloud.material.pointOpacityType = parameters.pointOpacityType;
  pointCloud.material.shape = parameters.shape;
  pointCloud.material.setHighlightIgnoreDepth(parameters.highlightIgnoreDepth);
  pointCloud.material.pointSizeType = parameters.pointSizeType;
  pointCloud.material.pointColorType = parameters.pointColorType;
  pointCloud.material.clippingPlanes = [clippingPlane];

  // pointCloud.material.setClipPolyhedra([{
  pointCloud.material.setHighlightPolyhedra([{
    outside: false,
    color: new Color(0xffff00),
    convexes: [{
     planes: [
       new Plane(new Vector3(-0.23640714656581407, -0.65759338107618, -0.7153199327695319), 5.982078455274273),
       new Plane(new Vector3(-0.6694967441207063, -0.7385242730936087, -0.07972457377327555), 3.6523286782910587),
       new Plane(new Vector3(0.49628440624014875, 0.6848974916633837, 0.5334952802378559), -3.511509247643808),
      ]
    },
    {
      planes: [
        new Plane(new Vector3(-0.6475844802133526, -0.5347307669341604, 0.5428603392041147), 2.481919875324591),
        new Plane(new Vector3(0.6694967441207063, 0.7385242730936087, 0.07972457377327552), -3.6523286782910587),
        new Plane(new Vector3(0.5816752160508767, 0.1388228158752384, -0.8014874726560831), 2.7728004709760365),
       ]
     }]
  }] as IClipPolyhedron[]);

  const camera = viewer.camera;
  camera.far = 1000;
  camera.updateProjectionMatrix();
  camera.position.set(0, 0, 10);
  camera.lookAt(new Vector3());

  viewer.add(pco);
}

const loadLion = () => {
  // viewer.load('cloud.js',
  //             'https://raw.githubusercontent.com/potree/potree/develop/pointclouds/lion_takanawa/')
  //   .then(onPCOLoad)
  //   .catch(err => console.error(err));
}

const loadYBF = () => {
  // const url = 'https://storage.googleapis.com/resonai-irocket-public/snap-master-colin-1605620427366522352-20201117134028/downsampled_ybf/H__Hamsa_015_2584c47f2cdf5b8a_50000.ybf'
  // viewer.loadSingle(url).then(onPCOLoad)
}

const loadResonaiPotree = () => {
  // const onLoad = (node: PointCloudOctreeGeometryNode) => {
  //   // console.log('Loaded node!', node);
  // }
  const onLoad = () => {};
  const jsonFile1 = 'gs://resonai-irocket-public/17555/potree_structure_files/S6P/r.json'
  const locJSON1 = 'gs://resonai-irocket-public/17555/potree_ybf/S6P/loc.json'
  fetch(gsToPath(locJSON1)).then(res => {
    res.text().then(text => {
      viewer.loadResonaiPotree(gsToPath(jsonFile1), JSON5.parse(text), [onLoad])
        .then(onPCOLoad)
        .catch(err => console.error(err));
    })
  })
  const jsonFile2 = 'gs://resonai-irocket-public/snap-rotem-colin-1640527467882721996-20211226140432/potree_structure_files/S1P/r.json'
  const locJSON2 = 'gs://resonai-irocket-public/snap-rotem-colin-1640527467882721996-20211226140432/potree_ybf/S1P/loc.json'
  fetch(gsToPath(locJSON2)).then(res => {
    res.text().then(text => {
      viewer.loadResonaiPotree(gsToPath(jsonFile2), JSON5.parse(text), [onLoad])
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

  gui.add(parameters, 'maxLevel', 1, 20).onChange(function (val: number) {
    if (pointCloud) {
      pointCloud.maxLevel = val;
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
  gui.add(parameters, 'highlightIgnoreDepth', false).onChange(function (val: boolean) {
    if (pointCloud) {
      pointCloud.material.setHighlightIgnoreDepth(val);
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
