import { Mesh, Vector2, Vector3, Camera, Quaternion, ShaderMaterial, Object3D } from 'three';
export declare class SplatsMesh extends Object3D {
  mesh: any;
  material: ShaderMaterial | null;
  private forceSorting;
  continuousSorting: boolean;
  totalSplats: number;
  private textureSorted;
  private texturePosColor;
  private textureCovariance0;
  private textureCovariance1;
  private textureNode;
  private textureNode2;
  private textureNodeIndices;
  private textureVisibilityNodes;
  private textureHarmonics1;
  private textureHarmonics2;
  private textureHarmonics3;
  private indexesBuffer;
  private bufferSorted;
  private bufferPosColor;
  private bufferCovariance0;
  private bufferCovariance1;
  private bufferNodes;
  private bufferNodes2;
  private bufferNodesIndices;
  private bufferVisibilityNodes;
  private bufferHarmonics1;
  private bufferHarmonics2;
  private bufferHarmonics3;
  private bufferCenters;
  private bufferPositions;
  private bufferScale;
  private bufferOrientation;
  private textures;
  private nodesAsString;
  private sorter;
  private lastSortViewDir;
  private sortViewDir;
  private lastSortViewPos;
  private sortViewOffset;
  private enableSorting;
  private enabled;
  private instanceCount;
  private debugMode;
  rendererSize: Vector2;
  private harmonicsEnabled;
  private maxPointBudget;
  constructor(debug: boolean | undefined, maxPointBudget: number, renderHamonics?: boolean);
  initialize(): Promise<void>;
  renderSplatsIDs(status: boolean): void;
  update(mesh: Mesh, camera: Camera, size: Vector2, callback?: () => void): boolean | undefined;
  defer(): Promise<unknown>;
  sortSplats(camera: Camera, callback?: () => void): void;
  getSplatData(
    globalID: any,
    nodeID: any,
  ): {
    position: any;
    scale: Vector3;
    orientation: Quaternion;
  } | null;
  dispose(): void;
  get splatsEnabled(): boolean;
}
