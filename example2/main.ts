import { ClipMode, PointCloudOctree } from '../src';
import { Viewer } from './viewer';

require('./main.css');

const targetEl: HTMLDivElement = document.createElement('div');
targetEl.className = 'container';
document.body.appendChild(targetEl);

const viewer: Viewer = new Viewer();
viewer.initialize(targetEl);
(window as any).viewer = viewer; // for debugging
viewer.useEDL = true;
interface PointCloudsConfig {
  file: string;
  url: string;
  version:'edl test';
}

const examplePointClouds: PointCloudsConfig[] = [
  {
    file: 'metadata.json',
    url: 'https://test-pix4d-cloud-eu-central-1.s3.eu-central-1.amazonaws.com/lion_takanawa_converted/',
    version: 'edl test',
  },
  
];

interface PointClouds {
  [key: string]: PointCloudOctree | undefined;
}

interface LoadedState {
  [key: string]: boolean;
}

const pointClouds: PointClouds = {
  edlOn: undefined,
  edlOff: undefined,
};

const loaded: LoadedState = {
  edlOn: false,
  edlOff: false,
};

function createButton(text: string, onClick: () => void): HTMLButtonElement {
  const button: HTMLButtonElement = document.createElement('button');
  button.textContent = text;
  button.addEventListener('click', onClick);
  return button;
}

function createSlider(name : string, min: number, max: number, step: number, initial: number, onChange: (value: number) => void): HTMLDivElement {
  const div = document.createElement('div');
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = min.toString();
  slider.max = max.toString();
  slider.step = step.toString();
  slider.value = initial.toString();
  slider.className = 'edl-slider';
  slider.addEventListener('input', () => onChange(parseFloat(slider.value)));
  div.appendChild(slider);
  const label = document.createElement('label');
  label.textContent = `EDL ${name}`;
  label.className = 'edl-label';
  div.appendChild(label);
  
  return div;
}

function setupPointCloud(version: 'edl test', file: string, url: string): void {
  if (loaded[version]) return;
  loaded[version] = true;
  

  viewer.load(file, url, 'v2')
    .then((pco) => {
      pointClouds[version] = pco;
      pco.material.size = 1.0;
      pco.material.pointColorType = 0;
      pco.material.clipMode = ClipMode.CLIP_HORIZONTALLY;
      pco.material.clipExtent = [0.0, 0.0, 1.0, 1.0];
      pco.position.set( 0, 0, 0);

      const camera = viewer.camera;
      camera.up.set(0, 0, 1);
      camera.far = 1000;
      camera.updateProjectionMatrix();
      camera.position.set(6, -4, 5);
      viewer.cameraControls.target.set(2, 3, 2);

      viewer.add(pco);
    })
    .catch((err) => console.error(err));
}

const btnContainer: HTMLDivElement = document.createElement('div');
btnContainer.className = 'btn-container';
document.body.appendChild(btnContainer);


const strengthSlider = createSlider( " Strength ", 0.1, 5.0, 0.1, 1.0, (val) => viewer.setEDLStrength(val));
const radiusSlider = createSlider(" Radius ",0.1, 5.0, 0.1, 1.0, (val) => viewer.setEDLRadius(val));
btnContainer.appendChild(strengthSlider);
btnContainer.appendChild(radiusSlider);

// Optional: toggle button for quick EDL switching
const toggleBtn = createButton('Toggle EDL', () => viewer.toggleEDL());
btnContainer.appendChild(toggleBtn);

examplePointClouds.forEach(setupUI);


function setupUI(cfg: PointCloudsConfig): void {
  const unloadBtn = createButton('Unload', () => {
    const pc = pointClouds[cfg.version];
    if (pc) {
      viewer.disposePointCloud(pc);
      pointClouds[cfg.version] = undefined;
      loaded[cfg.version] = false;
    }
  });

  const loadBtn = createButton('Load', () => setupPointCloud(cfg.version, cfg.file, cfg.url));
  const label = document.createElement('span');
  label.textContent = `Point Cloud (${cfg.version})`;
  const versionContainer: HTMLDivElement = document.createElement('div');
  versionContainer.className = 'version-container';
  versionContainer.appendChild(label);
  versionContainer.appendChild(loadBtn);
  versionContainer.appendChild(unloadBtn);
  btnContainer.appendChild(versionContainer);

}