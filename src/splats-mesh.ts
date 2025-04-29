import {
    Mesh, 
    Vector2, 
    RawShaderMaterial, 
    InstancedBufferGeometry,
    BufferGeometry,
    InstancedBufferAttribute,
    RGBAIntegerFormat,
    UnsignedIntType,
    DataTexture,
    RGBAFormat,
    FloatType,
    RGFormat,
    BufferAttribute,
    Matrix4,
    Vector3,
    RedIntegerFormat,
    Camera,
    Quaternion,
    Texture,
    ShaderMaterial,
    DoubleSide,
    GLSL3,
    Object3D
   } from 'three';

import { createSortWorker } from './workers/SortWorker';
import { PointCloudMaterial } from './materials';
 
const DELAYED_FRAMES = 1;

export class SplatsMesh extends Object3D{

    public mesh: any;
    public material: ShaderMaterial | null = null;
    public forceSorting: boolean = true;

    private nodesAsString: string = "";
    private texturePosColor: any;
    private textureCovariance0: any;
    private textureCovariance1: any;
    private textureNode: any;
    private textureNodeIndices: any;

    private textureHarmonics1: any;
    private textureHarmonics2: any;
    private textureHarmonics3: any;

    private bufferCenters: any;
    private bufferPositions: any;
    private bufferScale: any;
    private bufferOrientation: any;
    private bufferPosColor: any;
    private bufferCovariance0: any;
    private bufferCovariance1: any;
    private bufferNodes: any;
    private bufferNodesIndices: any;

    private bufferHarmonics1: any;
    private bufferHarmonics2: any;
    private bufferHarmonics3: any;

    private sorter: any;
    private lastSortViewDir = new Vector3(0, 0, -1);
    private sortViewDir = new Vector3(0, 0, -1);
    private lastSortViewPos = new Vector3();

    private sortViewOffset = new Vector3();
    private enableSorting = true;

    private indexesBuffer: any;

    private textures: Array<Texture> = new Array();
    private enabled: boolean = false;
    private texturesNeedUpdate = false;

    private instanceCount: number = 0;
    private debugMode = false;
    
    rendererSize = new Vector2();

    private harmonicsEnabled: boolean = false;

    constructor(debug: boolean = false) {
        super();
        this.debugMode = debug;
    }

    async initialize(maxPointBudget: number, renderHamonics = false) {

        this.harmonicsEnabled = renderHamonics

        this.sorter = await createSortWorker(maxPointBudget);

        this.indexesBuffer = new Int32Array(maxPointBudget);
        let indexesToSort = new Int32Array(maxPointBudget);
    
        for(let i = 0; i < maxPointBudget; i++) {
          this.indexesBuffer[i] = i;
          indexesToSort[i] = i;
        }
    
        const quadVertices = new Float32Array([
          -1, -1, 0.0, 
          1, -1, 0.0, 
          -1,  1, 0.0, 
          1,  1, 0.0  
        ]);
        const quadIndices = new Uint16Array([
          0, 1, 2, 
          2, 1, 3  

        ]);

        //Global mesh used to setup the global rendering of the points
        let shader = new ShaderMaterial({
                glslVersion: GLSL3,
                vertexShader: require('./materials/shaders/splats.vert').default,
                fragmentShader: require('./materials/shaders/splats.frag').default,
                transparent: true,
                depthTest: true,
                depthWrite: false,
                side: DoubleSide,
                uniforms: {
                    focal:{value: new Vector2(0, 0)},
                    inverseFocalAdjustment:{value: 1},
                    splatScale:{value: 1},
                    basisViewport:{value: new Vector2(0, 0)},
                    covarianceTexture0:{value: null},
                    covarianceTexture1:{value: null},
                    posColorTexture:{value: null},
                    nodeTexture:{value: null},
                    nodeIndicesTexture:{value: null},
                    indicesTexture:{value: null},
                    harmonicsTexture1:{value: null},
                    harmonicsTexture2:{value: null},
                    harmonicsTexture3:{value: null},
                    visibleNodes: {value: null},
                    cameraPosition:{value: new Vector3(0, 0, 0)},
                    harmonicsDegree:{value: 3},
                    renderIds:{value: false},
                    debugMode: {value: false},
                    renderOnlyHarmonics: {value: false},
                    harmonicsScale: {value: 4},
                    octreeSize: {value: 0},
                }
        });

        this.material = shader;

        let geom = new InstancedBufferGeometry();

        geom.setAttribute('position', new BufferAttribute(quadVertices, 3));
        geom.setIndex(new BufferAttribute(quadIndices, 1));
        geom.setAttribute('indexes_sorted', new InstancedBufferAttribute(indexesToSort, 1));
    
        this.mesh = new Mesh(geom, shader);
        this.mesh.frustumCulled = false;
        this.add(this.mesh);
    
        //Create the global textures
        let size = Math.ceil(Math.sqrt(maxPointBudget));
    
        this.bufferCenters = new Float32Array(size * size * 4);
        this.bufferPositions = new Float32Array(size * size * 4);
        this.bufferScale = new Float32Array(size * size * 3);
        this.bufferOrientation = new Float32Array(size * size * 4);
        this.bufferPosColor = new Uint32Array(size * size * 4);
        this.bufferCovariance0 = new Float32Array(size * size * 4);
        this.bufferCovariance1 = new Float32Array(size * size * 2);
        this.bufferNodes = new Float32Array(100 * 100 * 4);
        this.bufferNodesIndices = new Uint32Array(size * size);
    
    
        //For the harmonics
        let degree1Size = Math.ceil(Math.sqrt(maxPointBudget * 3));
        let degree2Size = Math.ceil(Math.sqrt(maxPointBudget * 5));
        let degree3Size = Math.ceil(Math.sqrt(maxPointBudget * 7));
    
        if(this.debugMode) console.log("max texture size: " + degree3Size + " point budget: " + maxPointBudget);
    
        this.bufferHarmonics1 = new Uint32Array(degree1Size * degree1Size);
        this.bufferHarmonics2 = new Uint32Array(degree2Size * degree2Size);
        this.bufferHarmonics3 = new Uint32Array(degree3Size * degree3Size);
    
        
        //This should be able to save up to 10000 nodes
        this.textureNode = new DataTexture(this.bufferNodes, 100, 100, RGBAFormat, FloatType);
    
        this.textureNodeIndices = new DataTexture(this.bufferNodesIndices, size, size, RedIntegerFormat, UnsignedIntType);
        this.textureNodeIndices.internalFormat = 'R32UI';
    
        this.textureCovariance0 = new DataTexture(this.bufferCovariance0, size, size, RGBAFormat, FloatType);
        this.textureCovariance1 = new DataTexture(this.bufferCovariance1, size, size, RGFormat, FloatType);
        this.texturePosColor = new DataTexture(this.bufferPosColor, size, size, RGBAIntegerFormat, UnsignedIntType);
        this.texturePosColor.internalFormat = 'RGBA32UI';
    
    
        this.textureHarmonics1 = new DataTexture(this.bufferHarmonics1, degree1Size, degree1Size, RedIntegerFormat, UnsignedIntType);
        this.textureHarmonics1.internalFormat = 'R32UI';
        this.textureHarmonics2 = new DataTexture(this.bufferHarmonics2, degree2Size, degree2Size, RedIntegerFormat, UnsignedIntType);
        this.textureHarmonics2.internalFormat = 'R32UI';
        this.textureHarmonics3 = new DataTexture(this.bufferHarmonics3, degree3Size, degree3Size, RedIntegerFormat, UnsignedIntType);
        this.textureHarmonics3.internalFormat = 'R32UI';

        this.textures.push(this.textureNode);
        this.textures.push(this.textureNodeIndices);
        this.textures.push(this.textureCovariance0);
        this.textures.push(this.textureCovariance1);
        this.textures.push(this.texturePosColor);
        this.textures.push(this.textureHarmonics1);
        this.textures.push(this.textureHarmonics2);
        this.textures.push(this.textureHarmonics3);

        this.textures.map(text => text.needsUpdate = true);

        this.material.uniforms["posColorTexture"].value = this.texturePosColor;
        this.material.uniforms["covarianceTexture0"].value = this.textureCovariance0;
        this.material.uniforms["covarianceTexture1"].value = this.textureCovariance1;
        this.material.uniforms["nodeTexture"].value = this.textureNode;
        this.material.uniforms["nodeIndicesTexture"].value = this.textureNodeIndices;
    
        this.material.uniforms["harmonicsTexture1"].value = this.textureHarmonics1;
        this.material.uniforms["harmonicsTexture2"].value = this.textureHarmonics2;
        this.material.uniforms["harmonicsTexture3"].value = this.textureHarmonics3;

        this.enabled = true;
    }

    renderSplatsIDs(status: boolean) {

        if(this.material == null) return;
        
        this.material.uniforms["renderIds"].value = status;
        this.material.transparent = !status;
    }

    update(mesh: Mesh, camera: Camera, size: Vector2, callback = () => {}) {

        if(this.material == null) return;

        this.material.uniforms["cameraPosition"].value = camera.position;

        let mat =  mesh.material as RawShaderMaterial;
        mat.visible = false;

        //Passing the visible nodes to the material
        this.material.uniforms.visibleNodes.value = mat.uniforms.visibleNodes.value;
        this.material.uniforms.octreeSize.value = mat.uniforms.octreeSize.value;

        let material = this.material as RawShaderMaterial;

        material.uniforms.basisViewport.value.set(
            1.0 / size.x,
            1.0 / size.y,
        );

        const focalLengthX =
        camera.projectionMatrix.elements[0] *
        0.5 *
        size.x;

        const focalLengthY =
        camera.projectionMatrix.elements[5] *
        0.5 *
        size.y;

        material.uniforms.focal.value.set(
            focalLengthX,
            focalLengthY,
        );      

        let instanceCount = 0;
        let nodesCount = 0;
        let nodesAsString = "";
        

        let totalMemoryUsed = 0;
        let totalMemoryInDisplay = 0;

        mesh.traverse(el => {
            let m = el as Mesh;
            let g = m.geometry as BufferGeometry;
            instanceCount += g.drawRange.count;
        });

        totalMemoryUsed = instanceCount * 56;

        mesh.traverseVisible(el => {
            nodesAsString += el.name;
        });

        this.forceSorting = false;
      
        if((nodesAsString != this.nodesAsString) && this.enableSorting) {
        
            this.nodesAsString = nodesAsString;

            instanceCount = 0;
            nodesCount = 0;

            mesh.traverseVisible(el => {

                let m = el as Mesh;
                let g = m.geometry as BufferGeometry;

                let pointCloudMaterial = mesh.material as PointCloudMaterial;
                const vnStart = pointCloudMaterial.visibleNodeTextureOffsets.get(el.name) || 0;
                const level =  m.name.length - 1;
                const packedData = 100000 * level + vnStart;

                let nodeInfo = [m.position.x, m.position.y, m.position.z, packedData];
                this.bufferNodes.set(nodeInfo, nodesCount * 4);

                this.bufferNodesIndices.set(new Uint32Array(g.drawRange.count).fill(nodesCount), instanceCount);

                //Used for sorting
                this.bufferCenters.set(g.getAttribute("raw_position").array, instanceCount * 4);

                //Used for raycasting
                this.bufferPositions.set(g.getAttribute("centers").array, instanceCount * 4);
                this.bufferScale.set(g.getAttribute("scale").array, instanceCount * 3);
                this.bufferOrientation.set(g.getAttribute("orientation").array, instanceCount * 4);

                //Used for rendering
                this.bufferCovariance0.set(g.getAttribute("COVARIANCE0").array, instanceCount * 4);
                this.bufferCovariance1.set(g.getAttribute("COVARIANCE1").array, instanceCount * 2);
                this.bufferPosColor.set(g.getAttribute("POS_COLOR").array, instanceCount * 4);

                if(this.harmonicsEnabled) {
                    this.bufferHarmonics1.set(g.getAttribute("HARMONICS1").array, instanceCount * 3);
                    this.bufferHarmonics2.set(g.getAttribute("HARMONICS2").array, instanceCount * 5);
                    this.bufferHarmonics3.set(g.getAttribute("HARMONICS3").array, instanceCount * 7);
                }

                instanceCount += g.drawRange.count;
                nodesCount ++;

            })


            totalMemoryInDisplay = instanceCount * 56;

            if(this.debugMode) {
                console.log("----------------------------");
                console.log("total memory in usage: " + Math.ceil(totalMemoryUsed / 1000000) + " MB");
                console.log("total memory displayed: " + Math.ceil(totalMemoryInDisplay / 1000000) + " MB");
                console.log("----------------------------");
            }

            this.instanceCount = instanceCount;

            this.texturesNeedUpdate = true;
            this.forceSorting = true;

            this.sortSplats(camera, callback);

      }
    
    }

    defer() {
        
        let promise = new Promise( (resolve) => {

            let counter = 0;

            let frameCounter = () => {
                let anim = requestAnimationFrame(frameCounter);
                if(counter == DELAYED_FRAMES) {
                    resolve("true");
                    cancelAnimationFrame(anim);
                }
                counter++;
            }
    
            frameCounter();

        });

        return promise;
    }

    sortSplats(camera: Camera, callback = () => {}) {
        
        if(this.mesh == null || this.instanceCount == 0) return;

        let mvpMatrix = new Matrix4();
        camera.updateMatrixWorld();
        mvpMatrix.copy(camera.matrixWorld).invert();
        mvpMatrix.premultiply(camera.projectionMatrix);
        mvpMatrix.multiply(this.mesh.matrixWorld);

        let angleDiff = 0;
        let positionDiff = 0;

        this.sortViewDir.set(0, 0, -1).applyQuaternion(camera.quaternion);
        angleDiff = this.sortViewDir.dot(this.lastSortViewDir);
        positionDiff = this.sortViewOffset
        .copy(camera.position)
        .sub(this.lastSortViewPos)
        .length();


        if ( (this.forceSorting || angleDiff <= 0.99 || positionDiff >= 1.0) && this.enableSorting ) {

            let sortMessage = {
                indices: this.indexesBuffer,
                centers: this.bufferCenters,
                modelViewProj: mvpMatrix.elements,
                totalSplats: this.instanceCount
            }

            // if(this.debugMode) console.log("sorting started");

            this.sorter.postMessage({
                sort: sortMessage
            })

            this.enableSorting = false;
            this.forceSorting = false;

            this.sorter.onmessage = async (e: any) => {
            
                if(e.data.dataSorted) {

                    if(e.data.dataSorted != null) {

                        let indexAttribute = this.mesh.geometry.getAttribute("indexes_sorted");
                        indexAttribute.array.set(new Int32Array(e.data.dataSorted), 0);
                        indexAttribute.needsUpdate = true;

                        if(this.texturesNeedUpdate) {
                            this.textures.map(text => text.needsUpdate = true);
                            this.texturesNeedUpdate = false;
                        }
    
                        this.mesh.geometry.instanceCount = this.instanceCount;
    
                        this.defer().then( _ => {
                            callback();
                            this.enableSorting = true;
                            // if(this.debugMode) {
                            //     console.log("sorting completed")
                            // }
                        });                   
    
                    } else {

                        this.enableSorting = true;

                    }

                    

                }

            }
        
            this.lastSortViewPos.copy(camera.position);
            this.lastSortViewDir.copy(this.sortViewDir);

        }

    }

    getSplatData(globalID:any, nodeID: any) {

        if(this.mesh == null) return null;

        let center = new Vector3();
        let offset = new Vector3();

        let scale = new Vector3();
        let orientation = new Quaternion();

        center.x = this.bufferPositions[4 * globalID + 0];
        center.y = this.bufferPositions[4 * globalID + 1];
        center.z = this.bufferPositions[4 * globalID + 2];

        scale.x = this.bufferScale[3 * globalID + 0];
        scale.y = this.bufferScale[3 * globalID + 1];
        scale.z = this.bufferScale[3 * globalID + 2];

        orientation.w = this.bufferOrientation[4 * globalID + 0];
        orientation.x = this.bufferOrientation[4 * globalID + 1];
        orientation.y = this.bufferOrientation[4 * globalID + 2];
        orientation.z = this.bufferOrientation[4 * globalID + 3];

        offset.x = this.bufferNodes[4 * nodeID + 0];
        offset.y = this.bufferNodes[4 * nodeID + 1];
        offset.z = this.bufferNodes[4 * nodeID + 2];

        center.add(offset);

        let result = this.mesh.localToWorld(center);

        return {
            position: result,
            scale,
            orientation
        }
                
    }

    dispose() {

        if(!this.enabled) return;

        //Terminate the sorter
        this.sorter.terminate();
        this.sorter = null;

        //Removing attributes
        this.mesh.geometry.dispose();

        //Remove the shader
        this.material?.dispose();

        //Removing textures
        this.textures.map(text => text.dispose());
        this.textures = [];

        //kill the buffers
        this.indexesBuffer = null;
        this.bufferCenters = null;
        this.bufferPositions = null;
        this.bufferScale = null;
        this.bufferOrientation = null;
        this.bufferPosColor = null;
        this.bufferCovariance0 = null;
        this.bufferCovariance1 = null;
        this.bufferNodes = null;
        this.bufferNodesIndices = null;

        //kill the mesh
        this.mesh = null;

        this.enabled = false;

    }

    get splatsEnabled(): boolean {
        return this.enabled;
    }

}