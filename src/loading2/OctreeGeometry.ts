import {Box3, Sphere, Vector3} from 'three';
import {OctreeGeometryNode} from './OctreeGeometryNode';
import {Metadata, NodeLoader} from './OctreeLoader';
import {PointAttributes} from './PointAttributes';

export class OctreeGeometry {
	root!: OctreeGeometryNode;

	url: string | null = null;

	pointAttributes: PointAttributes | null = null;

	spacing: number = 0;

	tightBoundingBox: Box3;

	numNodesLoading: number = 0;

	maxNumNodesLoading: number = 3;

	boundingSphere: Sphere;

	tightBoundingSphere: Sphere;

	offset!: Vector3;

	scale!: [number, number, number];

	disposed: boolean = false;

	projection?: Metadata['projection'];

	constructor(
		public loader: NodeLoader,
		public boundingBox: Box3,
	) {
		this.tightBoundingBox = this.boundingBox.clone();
		this.boundingSphere = this.boundingBox.getBoundingSphere(new Sphere());
		this.tightBoundingSphere = this.boundingBox.getBoundingSphere(new Sphere());
	}

	dispose(): void {
		this.root.traverse((node) => node.dispose());
		this.disposed = true;
	}

}
