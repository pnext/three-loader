// src/viewer/Viewer.ts
import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { PointCloudOctree, Potree, PotreeVersion } from '../src';
import { EDLPass } from '../src/materials/edl';

export class Viewer {
  private targetEl?: HTMLElement;
  private renderer = new WebGLRenderer();
  scene           = new Scene();
  camera          = new PerspectiveCamera(45, 1, 0.1, 1000);
  cameraControls!: OrbitControls;

  private potree_v1 = new Potree('v1');
  private potree_v2 = new Potree('v2');
  private pointClouds: PointCloudOctree[] = [];

  private prevTime?: number;
  private rafHandle?: number;

  // Optional EDL pass
  public edlPass?: EDLPass;
  public useEDL = true;

  initialize(targetEl: HTMLElement) {
    if (this.targetEl) return;
    this.targetEl = targetEl;
    targetEl.appendChild(this.renderer.domElement);

    this.camera.up.set(0, 0, 1);
    this.camera.rotation.order = 'ZYX';
    this.cameraControls = new OrbitControls(this.camera, this.renderer.domElement);

    // Create EDLPass right after we know initial size
    const { width, height } = targetEl.getBoundingClientRect();
    this.edlPass = new EDLPass(this.renderer, this.camera, width, height);

    window.addEventListener('resize', this.resize);
    this.resize();
    this.loop();
  }

  toggleEDL() {
    this.useEDL = !this.useEDL;
    console.log('EDL enabled:', this.useEDL);
  }

  destroy() {
    if (this.targetEl) {
      this.targetEl.removeChild(this.renderer.domElement);
      this.targetEl = undefined;
    }
    window.removeEventListener('resize', this.resize);
    if (this.rafHandle !== undefined) cancelAnimationFrame(this.rafHandle);
  }

  load(file: string, baseUrl: string, version: PotreeVersion = 'v1') {
    const loader = version === 'v1' ? this.potree_v1 : this.potree_v2;
    return loader.loadPointCloud(file, url => `${baseUrl}${url}`);
  }

  add(pco: PointCloudOctree) {
    this.scene.add(pco);
    this.pointClouds.push(pco);
  }

  disposePointCloud(pco: PointCloudOctree) {
    this.scene.remove(pco);
    pco.dispose();
    this.pointClouds = this.pointClouds.filter(c => c !== pco);
  }

  private update(_dt: number) {
    this.cameraControls.update();
    this.potree_v1.updatePointClouds(this.pointClouds, this.camera, this.renderer);
    this.potree_v2.updatePointClouds(this.pointClouds, this.camera, this.renderer);
  }

  private render() {
    if (this.useEDL && this.edlPass) {
      this.edlPass.render(this.scene);
    } else {
      this.renderer.setRenderTarget(null);
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
    }
  }

  private loop = (time?: number) => {
    if (time !== undefined && this.prevTime !== undefined) {
      this.update(time - this.prevTime);
      this.render();
    }
    this.prevTime = time;
    this.rafHandle = requestAnimationFrame(this.loop);
  };

  private resize = () => {
    if (!this.targetEl) return;
    const { width, height } = this.targetEl.getBoundingClientRect();
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);

    if (this.edlPass) {
      this.edlPass.setSize(width, height);
    }
  };
  
  setEDLStrength(value: number) {
    if (this.edlPass) {
      this.edlPass.setEDLStrength( value);
    }
  }

  setEDLRadius(value: number) {
    if (this.edlPass) {
      this.edlPass.setEDLRadius(value);
    }
  }

}
