import { Vector3 } from 'three';
import { Viewer } from './viewer';

require('./main.css');

const targetEl = document.createElement('div');
targetEl.className = 'container';
document.body.appendChild(targetEl);

const viewer = new Viewer();
viewer.initialize(targetEl);

viewer
  .load(
    'cloud.js',
    'https://raw.githubusercontent.com/potree/potree/develop/pointclouds/lion_takanawa/',
  )
  .then(pco => {
    const camera = viewer.camera;
    camera.far = 1000;
    camera.updateProjectionMatrix();

    camera.position.set(0, 0, 10);
    camera.lookAt(new Vector3());

    pco.rotateX(-Math.PI / 2);
    pco.material.size = 1.0;
  })
  .catch(err => console.error(err));
