import { Box3, Sphere, Vector3 } from 'three';
import { OctreeGeometryNode } from './octree-geometry-node';
import { Metadata, NodeLoader } from './octree-loader';
import { PointAttributes } from './point-attributes';
export declare class OctreeGeometry {
  loader: NodeLoader;
  boundingBox: Box3;
  boundingSphere: Sphere;
  tightBoundingBox: Box3;
  tightBoundingSphere: Sphere;
  maxNumNodesLoading: number;
  numNodesLoading: number;
  needsUpdate: boolean;
  disposed: boolean;
  offset: Vector3;
  pointAttributes: PointAttributes | null;
  projection?: Metadata['projection'];
  root: OctreeGeometryNode;
  scale: [number, number, number];
  spacing: number;
  url: string | null;
  constructor(loader: NodeLoader, boundingBox: Box3);
  dispose(): void;
}
