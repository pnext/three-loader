import { Attribute } from "./point-attributes";

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
		min: [number, number, number],
		max: [number, number, number],
	};
	encoding: string;
	attributes: Attribute[];
}
