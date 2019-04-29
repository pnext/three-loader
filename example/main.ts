// import { Vector3, Matrix4, Box3 } from 'three';
import { Vector3, Matrix4 } from 'three';
// import { PointCloudOctree, ClipMode, IClipBox, IClipSphere, IClipPlane } from '../src';
import { PointCloudOctree, ClipMode, IClipCylinder } from '../src';
// import { PointCloudOctree, ClipMode } from '../src';
import { Viewer } from './viewer';

require('./main.css');

const targetEl = document.createElement('div');
targetEl.className = 'container';
document.body.appendChild(targetEl);

const viewer = new Viewer();
viewer.initialize(targetEl);

let pointCloud: PointCloudOctree | undefined;
let loaded: boolean = false;

// let clipBox1: IClipBox | undefined;
// let clipBox2: IClipBox | undefined;
// let clipSphere: IClipSphere | undefined;
// let clipPlane: IClipPlane | undefined;
// let clipPlane2: IClipPlane | undefined;
let clipCylinder1: IClipCylinder | undefined;
// let clipCylinder2: IClipCylinder | undefined;

let currentTranslation = new Vector3();

const unloadBtn = document.createElement('button');
unloadBtn.textContent = 'Unload';
unloadBtn.addEventListener('click', () => {
  if (!loaded) {
    return;
  }

  viewer.unload();
  loaded = false;
});

const loadBtn = document.createElement('button');
loadBtn.textContent = 'Load';
loadBtn.addEventListener('click', () => {
  if (loaded) {
    return;
  }

  loaded = true;

  viewer
    .load(
      'cloud.js',
      'https://raw.githubusercontent.com/potree/potree/develop/pointclouds/lion_takanawa/',
    )
    .then(pco => {
      pointCloud = pco;
      pointCloud.rotateX(-Math.PI / 2);
      pointCloud.material.size = 1.0;

      viewer.addAxes();

      const camera = viewer.camera;
      camera.far = 1000;
      camera.updateProjectionMatrix();
      camera.position.set(0, 0, 10);
      camera.lookAt(new Vector3());

      viewer.add(pco);

      pointCloud.material.clipMode = ClipMode.HIGHLIGHT_INSIDE;
      
      let m1 = new Matrix4();
      // let m2 = new Matrix4();

      // CLIP CYLINDERS
      const newClipCylinder1 = {
        matrix: m1,
      }
      clipCylinder1 = newClipCylinder1;
      viewer.addClipCylinder(clipCylinder1);

      // const newClipCylinder2 = {
      //   matrix: m2,
      // }
      // clipCylinder2 = newClipCylinder2;
      // viewer.addClipCylinder(clipCylinder2);


      pointCloud.material.setClipCylinders([clipCylinder1]);

      // CLIP BOXES
      // const newClipBox1 = {
      //   matrix: m1,
      // }
      // clipBox1 = newClipBox1;
      // viewer.addClipBox(clipBox1, 0);

      // const newClipBox2 = {
      //   matrix: m2,
      // }
      // clipBox2 = newClipBox2;
      // viewer.addClipBox(clipBox2, 1);


      // pointCloud.material.setClipBoxes([clipBox1, clipBox2]);

      // CLIP SPHERE
      // const newClipSphere = {
      //   matrix: m,
      // }
      // clipSphere = newClipSphere;
      // pointCloud.material.setClipSpheres([clipSphere]);
      // viewer.addClipSphere(clipSphere);

      // CLIP PLANE
      // const newClipPlane = {
      //   matrix: m,
      // }
      // const newClipPlane2 = {
      //   matrix: m,
      // }
      // clipPlane = newClipPlane;
      // clipPlane2 = newClipPlane2;
      // pointCloud.material.setClipPlanes([clipPlane, clipPlane2]);
      // viewer.addClipPlane(clipPlane);
      // viewer.addClipPlane(clipPlane2);

    })
    .catch(err => console.error(err));
});

const modeBtn = document.createElement('button');
modeBtn.textContent = 'Mode';
modeBtn.addEventListener('click', () => {
  if (!loaded) {
    return;
  }
  viewer.updateClipMode();
});

function createSlider(min: string, max: string, startVal: string, id: string, type: string) {
  const newSlider = document.createElement('input');
  newSlider.type = 'range';
  newSlider.step = '0.01';
  newSlider.min = min;
  newSlider.max = max;
  newSlider.value = startVal;
  newSlider.className = 'slider';
  newSlider.id = id;
  newSlider.addEventListener('input', (event) => {
    if (event.type === 'input') {
      if (loaded) {
        if (type === 'x') {
          currentTranslation.x = parseFloat(newSlider.value);
          viewer.translateClipCylinder(currentTranslation, type);
        } else if (type === 'y') {
          currentTranslation.y = parseFloat(newSlider.value);
          viewer.translateClipCylinder(currentTranslation, type);
        } else if (type === 'z') {
          currentTranslation.z = parseFloat(newSlider.value);
          viewer.translateClipCylinder(currentTranslation, type);
        } else if (type === 'scale') {
          viewer.scaleClipCylinder(parseFloat(newSlider.value));
        } else if (type === 'Rx') {
          viewer.rotateClipCylinder(parseFloat(newSlider.value), 'x');
        } else if (type === 'Ry') {
          viewer.rotateClipCylinder(parseFloat(newSlider.value), 'y');
        } else if (type === 'Rz') {
          viewer.rotateClipCylinder(parseFloat(newSlider.value), 'z');
        } else if (type === 'scaleS') {
          viewer.scaleClipSphere(parseFloat(newSlider.value));
        } else if (type === 'PZ') {
          currentTranslation.z = parseFloat(newSlider.value);
          // viewer.translateClipPlane(currentTranslation, 'PZ');
        } else if (type === 'PR') {
          currentTranslation.z = parseFloat(newSlider.value);
          // viewer.rotateClipPlane(parseFloat(newSlider.value));
        } 
      }
    }
  });
  const newSliderLabel = document.createElement('p');
  newSliderLabel.className = 'slider-label';
  newSliderLabel.innerText = type;
  sliderContainer.appendChild(newSliderLabel);
  sliderContainer.appendChild(newSlider);
}

const btnContainer = document.createElement('div');
btnContainer.className = 'btn-container';
document.body.appendChild(btnContainer);
btnContainer.appendChild(unloadBtn);
btnContainer.appendChild(loadBtn);
btnContainer.appendChild(modeBtn);


const sliderContainer = document.createElement('div');
sliderContainer.className = 'slider-container';
document.body.appendChild(sliderContainer);
createSlider('-5', '5', '0', 'xSlider', 'x');
createSlider('-5', '5', '0', 'ySlider', 'y');
createSlider('-5', '5', '0', 'zSlider', 'z');
createSlider('0.01', '5', '2', 'scaleSlider', 'scale');
createSlider('-5', '5', '0', 'xSlider', 'Rx');
createSlider('-5', '5', '0', 'ySlider', 'Ry');
createSlider('-5', '5', '0', 'zSlider', 'Rz');
// createSlider('0.01', '5', '2', 'scaleSlider', 'scaleS');
// createSlider('-5', '5', '0', 'planeSlider', 'PZ');
// createSlider('-3.14', '3.14', '0', 'planeSliderR', 'PR');
