import { Plane, PlaneHelper } from 'three';
import { PointCloudOctree } from '../src';
import { IClipPolyhedron } from '../src/materials/clipping';
import { PointOpacityType, PointShape, PointSizeType, PointColorType } from '../src/materials/enums';
import { Viewer } from './viewer';
import { gsToPath } from '../src/utils/utils';
import sps from './hataasyia_9491_sps.json';
import polyhedron from './hataasyia_crown_polyhedron.json';

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

interface SerializedCamera {
  position: [number, number, number];
  quaternion: [number, number, number, number];
  target: [number, number, number];
}

const deserializeCamera = async (cameraJSON: string) => {
  if (!cameraJSON) {
    cameraJSON = await navigator.clipboard.readText()
  }
  const parsedCamera: SerializedCamera = JSON.parse(cameraJSON);
  viewer.cameraControls.target.set(...parsedCamera.target);
  viewer.camera.position.set(...parsedCamera.position);
  viewer.camera.quaternion.set(...parsedCamera.quaternion);
  viewer.camera.lookAt(viewer.cameraControls.target);
}

const serializeCamera = () => {
  return JSON.stringify({
    position: viewer.camera.position.toArray(),
    quaternion: viewer.camera.quaternion.toArray(),
    target: viewer.cameraControls.target.toArray()
  })

}

const copyCamera = () => {
  navigator.clipboard.writeText(serializeCamera());
}

const setDefaultCamera = () => {
  localStorage.setItem('defaultCamera', serializeCamera());
}

const clearDefaultCamera = () => {
  localStorage.removeItem('defaultCamera');
}

const parameters = {
  budget: 3e7,
  maxLevel: 20,
  minNodePixelSize: 40,
  'points size': 0.2,
  'clipping plane': -100,
  shape: PointShape.SQUARE,
  highlightIgnoreDepth: false,
  pointSizeType: PointSizeType.ATTENUATED,
  pointColorType: PointColorType.RGB,
  pointOpacityType: PointOpacityType.FIXED,
  demoPotree: DemoPotree.RESONAI_POTREE,
  copyCamera,
  deserializeCamera,
  setDefaultCamera,
  clearDefaultCamera
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

const onPCOLoad = (pco: PointCloudOctree, quat: number[], translation: number[]) => {
  pointClouds.push(pco);
  pco.maxLevel = parameters.maxLevel;
  pco.minNodePixelSize = parameters.minNodePixelSize;
  pco.potree.pointBudget = parameters.budget;
  pco.potree.maxNumNodesLoading = 8;
  // pointCloud.rotateX(-Math.PI / 2);
  pco.material.size = parameters['points size'];
  pco.material.pointOpacityType = parameters.pointOpacityType;
  pco.material.shape = parameters.shape;
  pco.material.setHighlightIgnoreDepth(parameters.highlightIgnoreDepth);
  pco.material.pointSizeType = parameters.pointSizeType;
  pco.material.pointColorType = parameters.pointColorType;
  pco.material.clippingPlanes = [clippingPlane];
  var quatTuple: [number, number, number, number] = [quat[0], quat[1], quat[2], quat[3]]
  var translationTuple: [number, number, number] = [translation[0], translation[1], translation[2]]
  pco.position.set(...translationTuple)
  pco.quaternion.set(...quatTuple)
  // pco.position.set(-4.943994811749849, 19.994607104408757, -18.05086635769811);
  // pco.quaternion.set(0.0040494408101606535, 0.9865631369397857, -0.0012931641867331405, 0.1633251560141326);

  // pointCloud.material.setClipPolyhedra([{
    pco.material.setHighlightPolyhedra([polyhedron] as IClipPolyhedron[]);
  viewer.add(pco);
}

const loadResonaiPotree = async () => {
  // const onLoad = (node: PointCloudOctreeGeometryNode) => {
  //   // console.log('Loaded node!', node);
  // }
  const onLoad = () => {};
  while (sps.length) {
    await Promise.all(sps.splice(0, 1).map(task => {
      // console.log('__________________');
      return fetch(gsToPath(task.loc)).then(res => {
        res.text().then(text => {
          return viewer.loadResonaiPotree(gsToPath(task.json), JSON5.parse(text), [onLoad])
            .then(pco => {
              // pco.visible = index % 2 === 0
              onPCOLoad(pco, task.quat, task.translation)
            })
            .catch(err => console.error(err));
        })
      })
    }))
  }
}

switch (parameters.demoPotree) {
  case DemoPotree.RESONAI_POTREE:
    const fallbackCamera = '{"position":[1.0595364337361601,19.164145572555945,-10.864988785269247],"quaternion":[0.003148537971741608,0.9831510066985465,0.18197479634187416,-0.017010532990133973],"target":[1.1869623756602856,17.752190898272897,-7.1836979194608706]}'
    const cameraParams = localStorage.getItem('defaultCamera') || fallbackCamera;
    deserializeCamera(cameraParams);
    loadResonaiPotree();
    break;
}
initGui();

function initGui() {
  gui = new GUI({ width: 300 });

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

  gui.add(parameters, 'maxLevel', 0, 20).onChange(function (val: number) {
    pointClouds.forEach(pointCloud => {
      pointCloud.maxLevel = val;
    })
  });

  gui.add(parameters, 'minNodePixelSize', 20, 1000).onChange(function (val: number) {
    pointClouds.forEach(pointCloud => {
      pointCloud.minNodePixelSize = val;
    })
  });

  gui.add(parameters, 'points size', 0.05, 1.5).onChange(function (val: number) {
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
      pointCloud.material.transparent = true;
    })
  });
  const shapeDict = Object.fromEntries(Object.entries(PointShape).filter(([_, v]) => typeof v !== 'string'))
  gui.add(parameters, 'shape', shapeDict).onChange(function (val: PointShape) {
    pointClouds.forEach(pointCloud => {
      pointCloud.material.shape = Number(val);
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
      pointCloud.material.pointSizeType = Number(val);
    })
  });
  const pointColorTypeDict = Object.fromEntries(Object.entries(PointColorType).filter(([_, v]) => typeof v !== 'string'))
  gui.add(parameters, 'pointColorType', pointColorTypeDict).onChange(function (val: PointColorType) {
    pointClouds.forEach(pointCloud => {
      pointCloud.material.pointColorType = Number(val);
    })
  });

  gui.add(parameters, 'copyCamera').name('Copy Camera');
  gui.add(parameters, 'deserializeCamera').name('Paste Camera');
  gui.add(parameters, 'setDefaultCamera').name('Set Default Camera');
  gui.add(parameters, 'clearDefaultCamera').name('Clear Default Camera');
}
