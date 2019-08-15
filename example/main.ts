import { Vector3 } from 'three';
import { PointCloudOctree } from '../src';
import { Viewer } from './viewer';

require('./main.css');

const targetEl = document.createElement('div');
targetEl.className = 'container';
document.body.appendChild(targetEl);

const viewer = new Viewer();
viewer.initialize(targetEl);

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

      const camera = viewer.camera;
      camera.far = 1000;
      camera.updateProjectionMatrix();
      camera.position.set(0, 0, 10);
      camera.lookAt(new Vector3());

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

  pointCloud.potree.pointBudget = parseInt(slider.value, 10);
  console.log(pointCloud.potree.pointBudget);
});

const btnContainer = document.createElement('div');
btnContainer.className = 'btn-container';
document.body.appendChild(btnContainer);
btnContainer.appendChild(unloadBtn);
btnContainer.appendChild(loadBtn);
btnContainer.appendChild(slider);
