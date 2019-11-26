import { Vector3 } from 'three';
import { PointCloudOctree } from '../src';
import { Viewer } from './viewer';

require('./main.css');

const targetEl = document.createElement('div');
targetEl.className = 'container';
document.body.appendChild(targetEl);

const targetEl2 = document.createElement('div');
targetEl2.className = 'container';
document.body.appendChild(targetEl2);

const viewer = new Viewer();
viewer.initialize(targetEl, targetEl2);

let pointCloud: PointCloudOctree | undefined;
let loaded: boolean = false;

const unloadBtn = document.createElement('button');
unloadBtn.textContent = 'Unload';
unloadBtn.addEventListener('click', () => {
  if (!loaded) {
    return;
  }

  viewer.unload();
  loaded = false;
  pointCloud = undefined;
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
      pco.showBoundingBox = true

      const camera = viewer.camera;
      camera.far = 1000;
      camera.updateProjectionMatrix();
      camera.position.set(0, 0, 10);
      camera.lookAt(new Vector3());
      //@ts-ignore
      targetEl.addEventListener('click', () => console.log('num visible pts', viewer.pointClouds[0].numVisiblePoints))

      const camera2 = viewer.camera2;
      camera2.far = 1000;
      camera2.updateProjectionMatrix();
      camera2.position.set(0, 0, 10);
      camera2.lookAt(new Vector3());
      //@ts-ignore
      targetEl2.addEventListener('click', () => console.log('num visible pts', viewer.pointClouds[0].numVisiblePoints))

      viewer.add(pco);
    })
    .catch(err => console.error(err));
});

const slider = document.createElement('input');
slider.type = 'range';
slider.min = String(10_000);
slider.max = String(500_000);
slider.className = 'budget-slider';

slider.addEventListener('change', () => {
  if (!pointCloud) {
    return;
  }

  pointCloud.potree.pointBudget = parseInt(slider.value, 10) * 10;
  console.log(pointCloud.potree.pointBudget);
});

const btnContainer = document.createElement('div');
btnContainer.className = 'btn-container';
document.body.appendChild(btnContainer);
btnContainer.appendChild(unloadBtn);
btnContainer.appendChild(loadBtn);
btnContainer.appendChild(slider);
