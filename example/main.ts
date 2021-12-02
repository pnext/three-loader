import { Vector3 } from 'three';
import { PointCloudMaterial, PointCloudOctree, PointColorType } from '../src';
import { Viewer } from './viewer';

require('./main.css');

const targetEl = document.createElement('div');
targetEl.className = 'container';
targetEl.id = 'container';
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

const materials: PointCloudMaterial[] = [];

const loadBtn = document.createElement('button');
loadBtn.textContent = 'Load';
loadBtn.addEventListener('click', () => {
  if (loaded) {
    return;
  }

  loaded = true;

  // const url = 'https://test-pix4d-cloud-default.s3-accelerate.amazonaws.com/user-365313/project-459823/post_processing/point_cloud/potree/';
  // const file = 'cloud.js?AWSAccessKeyId=ASIATOCJLBKSSY45LUTE&Expires=1638371341&Signature=LkHLb7QnjiqmL%2F%2BHKhBTTqtoF1k%3D&x-amz-security-token=FwoGZXIvYXdzEFAaDJr7zKYI8RGbtAYjJyK9AgkwPFXsJHXfTr9jbobhZ%2Fv3pT0PJQB6wFgqGUsbLraEYbIXIvNIdF9JMRxHDk92iFvughuN6CcqQFPlfDpyCZ8h6UoMeiK54A4wUldtX79IKk1A%2FI5RsTgcBLLrqUgyXVLjgHJQ9lfLE9YOtLx5GENyBCSVvw6RnXKTFa5LXp46sKvBExaUDGP6J1JD9vzAPL5%2F5nTdFH%2BB9sgvSVR3YxPasCRII1hUSmlLfJDEoshi0BiRR6YAUFDJBn8uh%2Fc%2B%2BuglwOXzCT1B1hYqGNmYsky1wmE11k0o0EIiSUGt1qGiD6kspr5U1%2BIPpJuz7TN5gtzNJ%2BsydTmiNR9TaJqeboQayvGj68O6zITuPGxzpbt6l%2F4TT1lj4u1%2F08qAIFeXwgAKf%2B8ZeTRR9fguHvTxgpFgyBJGQHWfMVImfZCJKIiZno0GMimEn%2F01GdLzfsrN9pqkpy2Buwi3EFZkT5XY1rhGHqJNy4JfmYGNxXiyKw%3D%3D';
  // viewer
  //   .load(
  //     file, url
  //   )
  //   .then(onPcoLoaded)
  //   .catch(err => console.error(err));

  viewer
    .load(
      'cloud.js',
      'https://raw.githubusercontent.com/potree/potree/develop/pointclouds/lion_takanawa/',
    )
    .then(onPcoLoaded)
    .catch(err => console.error(err));

  viewer
    .load(
      'cloud.js',
      'https://raw.githubusercontent.com/potree/potree/develop/pointclouds/lion_takanawa/',
    )
    .then(pco => { onPcoLoaded(pco, [0.5, 1.0, 0.0, 0.5], PointColorType.NORMAL) })
    .catch(err => console.error(err));

  viewer
    .load(
      'cloud.js',
      'https://raw.githubusercontent.com/potree/potree/develop/pointclouds/lion_takanawa/',
    )
    .then(pco => { onPcoLoaded(pco, [0.5, 1.0, 0.5, 1.0], PointColorType.HEIGHT) })
    .catch(err => console.error(err));

  viewer
    .load(
      'cloud.js',
      'https://raw.githubusercontent.com/potree/potree/develop/pointclouds/lion_takanawa/',
    )
    .then(pco => { onPcoLoaded(pco, [0.0, 0.5, 0.5, 1.0], PointColorType.DEPTH) })
    .catch(err => console.error(err));
});

function onPcoLoaded(pco: PointCloudOctree, clipRange: [number, number, number, number] = [0.0, 0.5, 0.0, 0.5], pointColorType: PointColorType = PointColorType.RGB) {
  pointCloud = pco;
  pointCloud.rotateX(-Math.PI / 2);
  pointCloud.material.size = 1.0;

  const camera = viewer.camera;
  camera.far = 1000;
  camera.updateProjectionMatrix();
  camera.position.set(0, 0, 10);
  camera.lookAt(new Vector3());

  viewer.add(pco);
  pco.material.pointColorType = pointColorType;
  pco.material.clipRange = clipRange;

  materials.push(pco.material);

  console.log(pco.material);

  // attach former root to tree node
  // pco.toTreeNode();
  pco.maxLevel = 3;
}

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

// const container = document.getElementById('container');
// container?.addEventListener('mousemove', (evt: MouseEvent) => {
//   // // update clip ranges
//   // const normalizedScreenX = (evt.clientX / window.innerWidth) * 2.0 - 1.0;
//   // const normalizedScreenY = -(evt.clientY / window.innerHeight) * 2.0 + 1.0;

//   // console.log(mouse.normalizedScreenX, mouse.normalizedScreenY);

//   // if(matPco !== undefined){
//   //   matPco.mouseX = mouse.normalizedScreenX * 0.5 + 0.5;
//   //   matPco.mouseY = mouse.normalizedScreenY * 0.5 + 0.5;
//   // }
// });
