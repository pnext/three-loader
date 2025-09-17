import { Box3 } from 'three';
import { GetUrlFn, XhrRequest } from '../loading/types';
import { OctreeGeometry } from './octree-geometry';
import { OctreeGeometryNode } from './octree-geometry-node';
import { PointAttributes } from './point-attributes';
import { WorkerPool } from './worker-pool';
export declare const HIERARCHY_FILE = 'hierarchy.bin';
export declare const OCTREE_FILE = 'octree.bin';
export declare const COMPRESSION_TYPE_FILE = 'pcl.gltf';
export declare const GLTF_COLORS_FILE = 'colors.glbin';
export declare const GLTF_POSITIONS_FILE = 'positions.glbin';
export declare class NodeLoader {
  url: string;
  metadata: Metadata;
  private loadingContext;
  private readonly decoder;
  constructor(url: string, metadata: Metadata, loadingContext: LoadingContext);
  load(node: OctreeGeometryNode): Promise<void>;
  private get workerPool();
  private get getUrl();
  private get xhrRequest();
  private get hierarchyPath();
  private get workerType();
  private parseHierarchy;
  private loadHierarchy;
  private getTightBoundingBox;
}
declare const typenameTypeattributeMap: {
  double: {
    ordinal: number;
    name: string;
    size: number;
  };
  float: {
    ordinal: number;
    name: string;
    size: number;
  };
  int8: {
    ordinal: number;
    name: string;
    size: number;
  };
  uint8: {
    ordinal: number;
    name: string;
    size: number;
  };
  int16: {
    ordinal: number;
    name: string;
    size: number;
  };
  uint16: {
    ordinal: number;
    name: string;
    size: number;
  };
  int32: {
    ordinal: number;
    name: string;
    size: number;
  };
  uint32: {
    ordinal: number;
    name: string;
    size: number;
  };
  int64: {
    ordinal: number;
    name: string;
    size: number;
  };
  uint64: {
    ordinal: number;
    name: string;
    size: number;
  };
};
type AttributeType = keyof typeof typenameTypeattributeMap;
type BufferView = {
  byteLength: number;
  byteOffset: number;
  uri: string;
};
export interface Attribute {
  name: string;
  description: string;
  size: number;
  numElements: number;
  type: AttributeType;
  min: number[];
  max: number[];
  bufferView: BufferView;
}
export interface Metadata {
  version: string;
  name: string;
  description: string;
  points: number;
  projection: string;
  hierarchy: {
    firstChunkSize: number;
    stepSize: number;
    depth: number;
  };
  offset: [number, number, number];
  scale: [number, number, number];
  spacing: number;
  boundingBox: {
    min: [number, number, number];
    max: [number, number, number];
  };
  encoding: string;
  attributes: Attribute[];
  compressed: boolean;
}
export interface PCL {
  asset: {
    extensions: {
      ext_pix4d_gltf_gs_version: {
        version: string;
      };
      OPF_asset_version: {
        version: string;
      };
    };
  };
}
export interface LoadingContext {
  workerPool: WorkerPool;
  basePath: string;
  hierarchyPath: string;
  octreePath: string;
  gltfColorsPath: string;
  gltfPositionsPath: string;
  harmonicsEnabled: boolean;
  getUrl: GetUrlFn;
  xhrRequest: XhrRequest;
}
export declare class OctreeLoader implements LoadingContext {
  workerPool: WorkerPool;
  basePath: string;
  hierarchyPath: string;
  octreePath: string;
  gltfColorsPath: string;
  gltfPositionsPath: string;
  harmonicsEnabled: boolean;
  getUrl: GetUrlFn;
  xhrRequest: XhrRequest;
  constructor(getUrl: GetUrlFn, url: string, xhrRequest: XhrRequest, loadHarmonics?: boolean);
  static parseAttributes(jsonAttributes: Attribute[]): PointAttributes;
  load(url: string): Promise<{
    geometry: OctreeGeometry;
  }>;
  private fetchMetadata;
  private fetchPCL;
  private applyCustomBufferURI;
  private createLoader;
  private createBoundingBox;
  private getOffset;
  private initializeOctree;
  private initializeRootNode;
  getTightBoundingBox(metadata: Metadata): Box3;
}
export {};
