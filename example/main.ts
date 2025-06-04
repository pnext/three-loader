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
    version: 'v1' | 'v2' | 'splats';
}

const examplePointClouds: PointCloudsConfig[] = [
    {
        file: 'cloud.js',
        url: 'https://raw.githubusercontent.com/potree/potree/develop/pointclouds/lion_takanawa/',
        version: 'v1',
    },
    {
        file: 'metadata.json',
        url: 'https://test-pix4d-cloud-eu-central-1.s3.eu-central-1.amazonaws.com/lion_takanawa_converted/',
        version: 'v2',
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
    v2: undefined,
    splats: undefined
};

const loaded: LoadedState = {
    v1: false,
    v2: false,
    splats: false
};

function createButton(text: string, onClick: (e: MouseEvent) => void): HTMLButtonElement {
    const button: HTMLButtonElement = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', onClick);
    return button;
}

function createSlider(version: string): HTMLInputElement {
    const slider: HTMLInputElement = document.createElement('input');
    slider.type = 'range';
    slider.min = '10000';
    slider.max = '1000000';
    slider.value = '1000000';
    slider.className = 'budget-slider';
    slider.addEventListener('change', () => {
        const cloud = pointClouds[version];
        if (!cloud) {
            return;
        }
        cloud.potree.pointBudget = parseInt(slider.value, 10);
        viewer.update(0);
        console.log(cloud.potree.pointBudget);
    });
    return slider;
}

function setupPointCloud(version: 'v1' | 'v2' | 'splats', file: string, url: string): void {
    if (loaded[version]) {
        return;
    }
    loaded[version] = true;

    //TODO: check for mobile, not noly IOS
    function isIOS() {
        const ua = navigator.userAgent;
        return ua.indexOf('iPhone') > 0 || ua.indexOf('iPad') > 0;
    }

    viewer.load(file, url, version == 'splats' ? 'v2' : version, !isIOS())
        .then(pco => {
            pointClouds[version] = pco;
            pco.material.size = 1.0;

            pco.material.pointColorType = 0;
            
            pco.material.clipMode = ClipMode.CLIP_HORIZONTALLY;
            pco.material.clipExtent = [0.0, 0.0, 1.0, 1.0];
            pco.position.set(0, 0, 0);

            const camera = viewer.camera;
            camera.up.set(0, 0, 1);
            camera.far = 1000;
            camera.updateProjectionMatrix();
            camera.position.set(-4, 4, 16);

            viewer.add(pco);
        })
        .catch(err => console.error(err));
}

function setupUI(cfg: PointCloudsConfig): void {

    const updateBtn = createButton("Update", (e: MouseEvent) => {
        e.stopPropagation();
        viewer.enableUpdate = !viewer.enableUpdate;
        updateBtn.style.backgroundColor = viewer.enableUpdate ? "#00ff00" : "#ff0000";
    })

    updateBtn.style.backgroundColor ="#00ff00";

    const slider = createSlider(cfg.version);

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

        viewer.enableUpdate = true;
        updateBtn.style.backgroundColor ="#00ff00";
    });

    const loadBtn = createButton('Load', (e: MouseEvent) => {
        e.stopPropagation();
        setupPointCloud(cfg.version, cfg.file, cfg.url)
        }
    );

    const btnContainer: HTMLDivElement = document.createElement('div');
    btnContainer.className = 'btn-container-' + cfg.version;
    document.body.appendChild(btnContainer);
    btnContainer.appendChild(unloadBtn);
    btnContainer.appendChild(loadBtn);
    btnContainer.append(updateBtn);
    btnContainer.appendChild(slider);

}

examplePointClouds.forEach(setupUI);