import {Box3, Sphere, Vector3} from 'three';
import {OctreeGeometryNode} from './OctreeGeometryNode';
import {Metadata, NodeLoader} from './OctreeLoader';
import {PointAttributes} from './PointAttributes';

export class OctreeGeometry {
	boundingSphere: Sphere;
	tightBoundingBox: Box3;
	tightBoundingSphere: Sphere;

	maxNumNodesLoading: number = 3;
	numNodesLoading: number = 0;

	disposed: boolean = false;
	offset!: Vector3;
	pointAttributes: PointAttributes | null = null;
	projection?: Metadata['projection'];
	root!: OctreeGeometryNode;
	scale!: [number, number, number];
	spacing: number = 0;
	url: string | null = null;

	constructor(
		public loader: NodeLoader,
		public boundingBox: Box3,
	) {
		this.tightBoundingBox = this.boundingBox.clone();
		this.boundingSphere = this.boundingBox.getBoundingSphere(new Sphere());
		this.tightBoundingSphere = this.boundingSphere.clone();
	}

	dispose(): void {
		this.root.traverse((node) => node.dispose());
		this.disposed = true;
	}

}
