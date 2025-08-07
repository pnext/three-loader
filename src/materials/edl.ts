// src/viewer/passes/EDLPass.ts
import {
  WebGLRenderer,
  WebGLRenderTarget,
  DepthTexture,
  UnsignedIntType,
  DepthFormat,
  NearestFilter,
  ClampToEdgeWrapping,
  Scene,
  OrthographicCamera,
  PlaneGeometry,
  Mesh,
  ShaderMaterial,
  Vector2,
  PerspectiveCamera,
  IUniform,
  Texture,
  Color,
} from 'three';

export class EDLPostProcessMaterial extends ShaderMaterial {
  public uniforms: { [uniform: string]: IUniform };
  constructor(width: number, height: number, near: number, far: number) {
    const uniforms = {
      near:        { value: near },
      far:         { value: far },
      colorMap:    { value: null as Texture | null },
      depthMap:    { value: null as Texture | null },
      edlStrength: { value: 1.0 },
      radius:      { value: 1.0 },
      screenWidth: { value: width },
      screenHeight:{ value: height },
      opacity:     { value: 1.0 },      
      edgeColor: { value: new Color(0x777777) }, // grey edge
      showEdgesOnly: { value: false },
      neighbours:  { value: [
        new Vector2(1, 0), new Vector2(-1, 0),
        new Vector2(0, 1), new Vector2(0, -1),
        new Vector2(1, 1), new Vector2(-1, 1),
        new Vector2(1, -1), new Vector2(-1, -1),
      ]},
    };

    super({
      vertexShader: require('./shaders/edl.vert').default,
      fragmentShader: require('./shaders/edl.frag').default,
      uniforms,
    });
    this.uniforms = uniforms;

    this.name = 'EDLPostProcessMaterial';
  }

  setSize(width: number, height: number) {
    this.uniforms.screenWidth.value = width;
    this.uniforms.screenHeight.value = height;
  }

  setInputTextures(rt: WebGLRenderTarget) {
    this.uniforms.colorMap.value = rt.texture;
    this.uniforms.depthMap.value = rt.depthTexture;
  }
}
class EDLDepthTex extends DepthTexture{
  constructor(width: number, height: number) {
    super(width, height, UnsignedIntType);  
    this.format      = DepthFormat;
    this.type        = UnsignedIntType;
    this.magFilter   = NearestFilter;
    this.minFilter   = NearestFilter;
    this.wrapS       = ClampToEdgeWrapping;
    this.wrapT       = ClampToEdgeWrapping;
    this.generateMipmaps = false;
    this.flipY       = false;
    
  }
}

export class EDLPass {
  private rt: WebGLRenderTarget;
  private quadScene: Scene;
  private quadCamera: OrthographicCamera;
  private material: EDLPostProcessMaterial;
  constructor(
    private renderer: WebGLRenderer,
    private camera: PerspectiveCamera|OrthographicCamera,
    width: number,
    height: number
  ) {
    // 1) create render target + depth texture
    this.rt = new WebGLRenderTarget(width, height);    
    this.rt.depthTexture = new EDLDepthTex(width, height);
    this.rt.depthBuffer  = true;
    
    // 2) build shader material
    this.material = new EDLPostProcessMaterial( width, height, camera.near, camera.far);

    // 3) quad scene + camera
    this.quadCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.quadScene  = new Scene();
    this.quadScene.add(new Mesh(new PlaneGeometry(2, 2), this.material));
  }

  setSize(width: number, height: number) {
    this.rt.setSize(width, height);
    this.material.setSize(width,height);
  }

  render(scene: Scene) {
    this.renderer.setRenderTarget(this.rt);
    this.renderer.clear();
    this.renderer.render(scene, this.camera);

    this.renderer.setRenderTarget(null);
    this.material.setInputTextures(this.rt);
    this.renderer.render(this.quadScene, this.quadCamera);
    
  }
    
  dispose() {
    this.rt.dispose();
    this.material.dispose();
    this.quadScene.clear();
  }
  setEDLStrength(value: number) {
    this.material.uniforms.edlStrength.value = value;
    console.log(`EDL strength set to ${value}`);
  }
  setEDLRadius(value: number) {
    this.material.uniforms.radius.value = value;
  }
  setEDLEdgeColor(color: string) {
    this.material.uniforms.edgeColor.value.set(color);
  }
  setShowEdgesOnly(value: boolean) {
    console.log(value);
    this.material.uniforms.showEdgesOnly.value = value;
  }

}
