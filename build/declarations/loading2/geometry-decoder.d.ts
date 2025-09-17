import { BufferGeometry } from 'three';
import { OctreeGeometryNode } from './octree-geometry-node';
import { WorkerType } from './worker-pool';
export interface DecodedGeometry {
  buffer: ArrayBuffer;
  geometry: BufferGeometry;
  data: {
    tightBoundingBox: {
      min: number[];
      max: number[];
    };
    density?: number;
  };
}
export interface GeometryDecoder {
  readonly workerType: WorkerType;
  decode(node: OctreeGeometryNode, worker: Worker): Promise<DecodedGeometry | undefined>;
}
