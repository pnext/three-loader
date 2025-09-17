import { DecodedGeometry, GeometryDecoder } from './geometry-decoder';
import { OctreeGeometryNode } from './octree-geometry-node';
import { LoadingContext, Metadata } from './octree-loader';
import { WorkerType } from './worker-pool';
export declare class GltfSplatDecoder implements GeometryDecoder {
  metadata: Metadata;
  private context;
  readonly workerType: WorkerType;
  private _metadata;
  private compressed;
  constructor(metadata: Metadata, context: LoadingContext);
  decode(node: OctreeGeometryNode, worker: Worker): Promise<DecodedGeometry | undefined>;
  private get getUrl();
  private get xhrRequest();
  private get harmonicsEnabled();
}
