import { Vector3 } from 'three';
import { ClipMode, PointCloudOctree } from '../src';
import { Viewer } from './viewer';

require('./main.css');

const targetEl: HTMLDivElement = document.createElement('div');
targetEl.className = 'container';
document.body.appendChild(targetEl);

const viewer: Viewer = new Viewer();
viewer.initialize(targetEl);

interface PointCloudsConfig {
    file: string;
    url: string;
    version: 'v1' | 'v2';
}

const examplePointClouds: PointCloudsConfig[] = [
    {
        file: 'cloud.js',
        url: 'https://raw.githubusercontent.com/potree/potree/develop/pointclouds/lion_takanawa/',
        version: 'v1'
    }, {
        file: 'metadata.json',
        // url: 'https://test-pix4d-cloud-eu-central-1.s3.eu-central-1.amazonaws.com/lion_takanawa_converted/',
        // url: 'http://localhost:8080/gaussian/gltf/converted/',
        url: 'http://localhost:8080/gaussian/tiled/glTF/converted/',
        version: 'v2'
    }
];

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
            console.log(pco);
            pointClouds[version] = pco;
            pco.rotateX(-Math.PI / 2);
            pco.material.size = 100.0;

            pco.material.pointColorType = 0;
            pco.material.opacity = 0.999;
            
            pco.material.clipMode = ClipMode.CLIP_HORIZONTALLY;
            pco.material.clipExtent = [0.0, 0.0, 1.0, 1.0];
            pco.position.set(0, 0, 0);

            const camera = viewer.camera;
            camera.far = 1000;
            camera.updateProjectionMatrix();
            camera.position.set(20, 9, -11);
            camera.lookAt(new Vector3());

            viewer.add(pco);
        })
        .catch(err => console.error(err));
}

function setupUI(cfg: PointCloudsConfig): void {
    const unloadBtn = createButton('Unload', () => {
        if (!loaded[cfg.version]) {
            return;
        }

        const pointCloud = pointClouds[cfg.version];
        if (!pointCloud) {
            return;
        }
        viewer.disposePointCloud(pointCloud);
        loaded[cfg.version] = false;
        pointClouds[cfg.version] = undefined;
    });

    const loadBtn = createButton('Load', () => setupPointCloud(cfg.version, cfg.file, cfg.url));

    const slider = createSlider(cfg.version);

    const btnContainer: HTMLDivElement = document.createElement('div');
    btnContainer.className = 'btn-container-' + cfg.version;
    document.body.appendChild(btnContainer);
    btnContainer.appendChild(unloadBtn);
    btnContainer.appendChild(loadBtn);
    btnContainer.appendChild(slider);
}

examplePointClouds.forEach(setupUI);