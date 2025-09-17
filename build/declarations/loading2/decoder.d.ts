import { BufferGeometry } from 'three';
import { GeometryDecoder } from './geometry-decoder';
import { OctreeGeometryNode } from './octree-geometry-node';
import { LoadingContext, Metadata } from './octree-loader';
import { WorkerType } from './worker-pool';
export declare const HIERARCHY_FILE = 'hierarchy.bin';
export declare const OCTREE_FILE = 'octree.bin';
export declare const GLTF_COLORS_FILE = 'colors.glbin';
export declare const GLTF_POSITIONS_FILE = 'positions.glbin';
export declare class Decoder implements GeometryDecoder {
  metadata: Metadata;
  private context;
  readonly workerType = WorkerType.DECODER_WORKER;
  private _metadata;
  constructor(metadata: Metadata, context: LoadingContext);
  decode(
    node: OctreeGeometryNode,
    worker: Worker,
  ): Promise<{
    data: any;
    buffer: ArrayBuffer;
    geometry: BufferGeometry<import('three').NormalBufferAttributes>;
  }>;
  private get getUrl();
  private get xhrRequest();
  private get octreePath();
  private readSuccessMessage;
}
