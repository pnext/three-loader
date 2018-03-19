import { Box3, Vector3 } from 'three';
import { BinaryLoader } from './loading';
import { PointAttributes } from './point-attributes';
import { PointCloudOctreeGeometryNode } from './point-cloud-octree-geometry-node';

export class PointCloudOctreeGeometry {
  root!: PointCloudOctreeGeometryNode;
  octreeDir: string = '';
  hierarchyStepSize: number = -1;
  nodes: Record<string, PointCloudOctreeGeometryNode> = {};
  numNodesLoading: number = 0;
  maxNumNodesLoading: number = 3;
  spacing: number = 0;
  pointAttributes: PointAttributes = new PointAttributes([]);
  projection: any = null;
  url: string | null = null;
  needsUpdate: boolean = true;

  constructor(
    public loader: BinaryLoader,
    public boundingBox: Box3,
    public tightBoundingBox: Box3,
    public offset: Vector3,
  ) {}
}
