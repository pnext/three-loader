import { Plane, PlaneHelper, Vector3 } from 'three';
import { PointCloudOctree } from '../src';
import { PointOpacityType, PointShape, PointSizeType, PointColorType } from '../src/materials/enums';
import { Viewer } from './viewer';

// @ts-ignore
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';

require('./main.css');

let gui: GUI;

const parameters = {
  budget: 1e5,
  'points size': 1,
  'clipping plane': 0,
  shape: PointShape.SQUARE,
  pointSizeType: PointSizeType.FIXED,
  pointColorType: PointColorType.RGB,
  pointOpacityType: PointOpacityType.FIXED
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

const load = () => {
  viewer
    .load(
      'cloud.js',
      'https://raw.githubusercontent.com/potree/potree/develop/pointclouds/lion_takanawa/',
    )
    .then(pco => {
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
    })
    .catch(err => console.error(err));
}
load();
initGui();

function initGui() {
  gui = new GUI();

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