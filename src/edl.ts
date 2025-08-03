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
} from 'three';

export class EDLPass {
  private rt: WebGLRenderTarget;
  private quadScene: Scene;
  private quadCamera: OrthographicCamera;
  private material: ShaderMaterial;
  public uniforms: { [uniform: string]: IUniform };
  constructor(
    private renderer: WebGLRenderer,
    private camera: PerspectiveCamera,
    width: number,
    height: number
  ) {
    // 1) create render target + depth texture
    this.rt = new WebGLRenderTarget(width, height);
    const depthTex = new DepthTexture(width, height, UnsignedIntType);
    depthTex.format      = DepthFormat;
    depthTex.type        = UnsignedIntType;
    depthTex.magFilter   = NearestFilter;
    depthTex.minFilter   = NearestFilter;
    depthTex.wrapS       = ClampToEdgeWrapping;
    depthTex.wrapT       = ClampToEdgeWrapping;
    depthTex.generateMipmaps = false;
    depthTex.flipY       = false;
    this.rt.depthTexture = depthTex;
    this.rt.depthBuffer  = true;
    this.uniforms =   {
        near:        { value: camera.near },
        far:         { value: camera.far },
        colorMap:    { value: null },
        depthMap:    { value: null },
        edlStrength: { value: 1 },
        radius:      { value: 1.0 },
        screenWidth: { value: width },
        screenHeight:{ value: height },
        opacity:     { value: 1 },
        depthFalloff:{ value: 1 },
        neighbours:  { value: [
          new Vector2(1, 0), new Vector2(-1, 0),
          new Vector2(0, 1), new Vector2(0, -1),
          new Vector2(1, 1), new Vector2(-1, 1),
          new Vector2(1, -1),new Vector2(-1, -1),
        ]},
      },
   
    // 2) build shader material
    this.material = new ShaderMaterial({
      vertexShader:   require('./materials/shaders/edl.vert').default,
      fragmentShader: require('./materials/shaders/edl.frag').default,
      uniforms:       this.uniforms,
     
    });

    // 3) quad scene + camera
    this.quadCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.quadScene  = new Scene();
    const quadGeo   = new PlaneGeometry(2, 2);
    this.quadScene.add(new Mesh(quadGeo, this.material));
  }

  setSize(width: number, height: number) {
    this.rt.setSize(width, height);
    this.material.uniforms.screenWidth.value  = width;
    this.material.uniforms.screenHeight.value = height;
  }

  render(scene: Scene) {
    this.renderer.setRenderTarget(this.rt);
    this.renderer.clear();
    this.renderer.render(scene, this.camera);

    this.renderer.setRenderTarget(null);
    this.material.uniforms.colorMap.value = this.rt.texture;
    this.material.uniforms.depthMap.value = this.rt.depthTexture;
    this.renderer.render(this.quadScene, this.quadCamera);
  }
}
