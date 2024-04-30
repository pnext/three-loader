import { Vector3 } from 'three';
import { ClipMode, PointCloudOctree } from '../src';
import { Viewer } from './viewer';

require('./main.css');

const targetEl: HTMLDivElement = document.createElement('div');
targetEl.className = 'container';
document.body.appendChild(targetEl);

const viewer: Viewer = new Viewer();
viewer.initialize(targetEl);

interface PointClouds {
    [key: string]: PointCloudOctree | undefined;
}

interface LoadedState {
    [key: string]: boolean;
}

const pointClouds: PointClouds = {
    v1: undefined,
    v2: undefined
};

const loaded: LoadedState = {
    v1: false,
    v2: false
};

function createButton(text: string, onClick: () => void): HTMLButtonElement {
    const button: HTMLButtonElement = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', onClick);
    return button;
}

function createSlider(version: string): HTMLInputElement {
    const slider: HTMLInputElement = document.createElement('input');
    slider.type = 'range';
    slider.min = '10000';
    slider.max = '500000';
    slider.className = 'budget-slider';
    slider.addEventListener('change', () => {
        const cloud = pointClouds[version];
        if (!cloud) {
            return;
        }
        cloud.potree.pointBudget = parseInt(slider.value, 10);
        console.log(cloud.potree.pointBudget);
    });
    return slider;
}

function setupPointCloud(version: 'v1' | 'v2', file: string, url: string): void {
    if (loaded[version]) {
        return;
    }
    loaded[version] = true;

    viewer.load(file, url, version)
        .then(pco => {
            pointClouds[version] = pco;
            pco.rotateX(-Math.PI / 2);
            pco.material.size = 1.0;
            pco.material.clipMode = ClipMode.CLIP_HORIZONTALLY;
            pco.material.clipExtent = [0.0, 0.0, 1.0, 1.0];

            const camera = viewer.camera;
            camera.far = 1000;
            camera.updateProjectionMatrix();
            camera.position.set(0, 0, 10);
            camera.lookAt(new Vector3());

            viewer.add(pco);
        })
        .catch(err => console.error(err));
}

function setupUI(version: 'v1' | 'v2'): void {
    const unloadBtn = createButton('Unload', () => {
        if (!loaded[version]) {
            return;
        }
        viewer.unload();
        loaded[version] = false;
        pointClouds[version] = undefined;
    });

    const loadBtn = createButton('Load', () => setupPointCloud(version,
        version === 'v1' ? 'cloud.js' : 'metadata.json',
        version === 'v1' ? 'https://raw.githubusercontent.com/potree/potree/develop/pointclouds/lion_takanawa/' :
        'https://test-pix4d-cloud-eu-central-1.s3.eu-central-1.amazonaws.com/lion_takanawa_converted/'
    ));

    const slider = createSlider(version);

    const btnContainer: HTMLDivElement = document.createElement('div');
    btnContainer.className = 'btn-container-' + version;
    document.body.appendChild(btnContainer);
    btnContainer.appendChild(unloadBtn);
    btnContainer.appendChild(loadBtn);
    btnContainer.appendChild(slider);
}

setupUI('v1');
setupUI('v2');
