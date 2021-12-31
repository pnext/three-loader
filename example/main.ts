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
  minNodePixelSize: 50,
  'points size': 1,
  'clipping plane': -1000,
  shape: PointShape.SQUARE,
  highlightIgnoreDepth: false,
  pointSizeType: PointSizeType.ATTENUATED,
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


const clippingPlane = new Plane();
const planeHelper = new PlaneHelper(clippingPlane, 5, 0xffc919);
clippingPlane.constant = -parameters['clipping plane'];
viewer.scene.add(planeHelper);

let pointClouds: PointCloudOctree[] = [];

const onPCOLoad = (pco: PointCloudOctree) => {
  pointClouds.push(pco);
  pco.maxLevel = parameters.maxLevel;
  pco.minNodePixelSize = parameters.minNodePixelSize;
  pco.potree.pointBudget = parameters.budget;
  pco.potree.maxNumNodesLoading = 16;
  // pointCloud.rotateX(-Math.PI / 2);
  pco.material.size = parameters['points size'];
  pco.material.pointOpacityType = parameters.pointOpacityType;
  pco.material.shape = parameters.shape;
  pco.material.setHighlightIgnoreDepth(parameters.highlightIgnoreDepth);
  pco.material.pointSizeType = parameters.pointSizeType;
  pco.material.pointColorType = parameters.pointColorType;
  pco.material.clippingPlanes = [clippingPlane];
  // pco.position.set(-4.943994811749849, 19.994607104408757, -18.05086635769811);
  // pco.quaternion.set(0.0040494408101606535, 0.9865631369397857, -0.0012931641867331405, 0.1633251560141326);

  // pointCloud.material.setClipPolyhedra([{
    pco.material.setHighlightPolyhedra([{
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
  camera.position.set(-7.994910999999999, 20.095619, -18.737658);
  camera.lookAt(new Vector3());

  viewer.add(pco);
}

const sps = [
  // { // old
  //   loc: 'gs://resonai-irocket-public/17555/potree_ybf/S6P/loc.json',
  //   json: 'gs://resonai-irocket-public/17555/potree_structure_files/S6P/r.json'
  // },
  // { // with nulls
  //   loc: 'gs://resonai-irocket-public/snap-rotem-colin-1640527467882721996-20211226140432/potree_ybf/S1P/loc.json',
  //   json: 'gs://resonai-irocket-public/snap-rotem-colin-1640527467882721996-20211226140432/potree_structure_files/S1P/r.json'
  // },
  // { // deep tree
  //   loc: 'gs://resonai-irocket-public/5449/potree_ybf/S1P/loc.json',
  //   json: 'gs://resonai-irocket-public/5449/potree_structure_files/S1P/r.json'
  // },
  {
    loc: 'gs://resonai-irocket-public/5450/potree_ybf/S0P/loc.json',
    json: 'gs://resonai-irocket-public/5450/potree_structure_files/S0P/r.json'
  },
  {
    loc: 'gs://resonai-irocket-public/5450/potree_ybf/S1P/loc.json',
    json: 'gs://resonai-irocket-public/5450/potree_structure_files/S1P/r.json'
  },
  {
    loc: 'gs://resonai-irocket-public/5450/potree_ybf/S2P/loc.json',
    json: 'gs://resonai-irocket-public/5450/potree_structure_files/S2P/r.json'
  },
  {
    loc: 'gs://resonai-irocket-public/5450/potree_ybf/S3P/loc.json',
    json: 'gs://resonai-irocket-public/5450/potree_structure_files/S3P/r.json'
  },
  {
    loc: 'gs://resonai-irocket-public/5450/potree_ybf/S4P/loc.json',
    json: 'gs://resonai-irocket-public/5450/potree_structure_files/S4P/r.json'
  },
  {
    loc: 'gs://resonai-irocket-public/5450/potree_ybf/S5P/loc.json',
    json: 'gs://resonai-irocket-public/5450/potree_structure_files/S5P/r.json'
  },
  {
    loc: 'gs://resonai-irocket-public/5450/potree_ybf/S6P/loc.json',
    json: 'gs://resonai-irocket-public/5450/potree_structure_files/S6P/r.json'
  },
  {
    loc: 'gs://resonai-irocket-public/5450/potree_ybf/S7P/loc.json',
    json: 'gs://resonai-irocket-public/5450/potree_structure_files/S7P/r.json'
  },
  {
    loc: 'gs://resonai-irocket-public/5450/potree_ybf/S8P/loc.json',
    json: 'gs://resonai-irocket-public/5450/potree_structure_files/S8P/r.json'
  }
]

const loadResonaiPotree = () => {
  // const onLoad = (node: PointCloudOctreeGeometryNode) => {
  //   // console.log('Loaded node!', node);
  // }
  const onLoad = () => {};
  sps.forEach(({ loc, json }) => {
    fetch(gsToPath(loc)).then(res => {
      res.text().then(text => {
        viewer.loadResonaiPotree(gsToPath(json), JSON5.parse(text), [onLoad])
          .then(onPCOLoad)
          .catch(err => console.error(err));
      })
    })
  })
}

switch (parameters.demoPotree) {
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
      case DemoPotree[DemoPotree.RESONAI_POTREE]:
        loadResonaiPotree();
        break;
    }
  });

  gui.add(parameters, 'budget', 1e3, 1e8).onChange(function (val: number) {
    pointClouds.forEach(pointCloud => {
      pointCloud.potree.pointBudget = val;
    })
  });

  gui.add(parameters, 'maxLevel', 1, 20).onChange(function (val: number) {
    pointClouds.forEach(pointCloud => {
      pointCloud.maxLevel = val;
    })
  });

  gui.add(parameters, 'minNodePixelSize', 20, 1000).onChange(function (val: number) {
    pointClouds.forEach(pointCloud => {
      pointCloud.minNodePixelSize = val;
    })
  });

  gui.add(parameters, 'points size', 1, 10).onChange(function (val: number) {
    pointClouds.forEach(pointCloud => {
      pointCloud.material.size = val;
    })
  });

  gui.add(parameters, 'clipping plane', -30, 100, 0.1).onChange(function (val: number) {
    clippingPlane.constant = -val;
  });

  const pointOpacityTypeDict = Object.fromEntries(Object.entries(PointOpacityType).filter(([_, v]) => typeof v !== 'string'))
  gui.add(parameters, 'pointOpacityType', pointOpacityTypeDict).onChange(function (val: PointOpacityType) {
    pointClouds.forEach(pointCloud => {
      pointCloud.material.pointOpacityType = val;
    })
  });
  const shapeDict = Object.fromEntries(Object.entries(PointShape).filter(([_, v]) => typeof v !== 'string'))
  gui.add(parameters, 'shape', shapeDict).onChange(function (val: PointShape) {
    pointClouds.forEach(pointCloud => {
      pointCloud.material.shape = val;
    })
  });
  gui.add(parameters, 'highlightIgnoreDepth', false).onChange(function (val: boolean) {
    pointClouds.forEach(pointCloud => {
      pointCloud.material.setHighlightIgnoreDepth(val);
    })
  });
  const pointSizeTypeDict = Object.fromEntries(Object.entries(PointSizeType).filter(([_, v]) => typeof v !== 'string'))
  gui.add(parameters, 'pointSizeType', pointSizeTypeDict).onChange(function (val: PointSizeType) {
    pointClouds.forEach(pointCloud => {
      pointCloud.material.pointSizeType = val;
    })
  });
  const pointColorTypeDict = Object.fromEntries(Object.entries(PointColorType).filter(([_, v]) => typeof v !== 'string'))
  gui.add(parameters, 'pointColorType', pointColorTypeDict).onChange(function (val: PointColorType) {
    pointClouds.forEach(pointCloud => {
      pointCloud.material.pointColorType = val;
    })
  });
}
