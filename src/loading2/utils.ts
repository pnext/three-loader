import { Box3, Vector3 } from "three";

const tmpVec3 = new Vector3();
export function createChildAABB(aabb: Box3, index: number) {
	const min = aabb.min.clone();
	const max = aabb.max.clone();
	const size = tmpVec3.subVectors(max, min);

	if ((index & 0b0001) > 0) {
		min.z += size.z / 2;
	} else {
		max.z -= size.z / 2;
	}

	if ((index & 0b0010) > 0) {
		min.y += size.y / 2;
	} else {
		max.y -= size.y / 2;
	}

	if ((index & 0b0100) > 0) {
		min.x += size.x / 2;
	} else {
		max.x -= size.x / 2;
	}

	return new Box3(min, max);
}

export function appendBuffer(buffer1: any, buffer2: any) {
	var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
	tmp.set(new Uint8Array(buffer1), 0);
	tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
	return tmp.buffer;
}

export function extractBasePath(url: string): string {
    return url.substring(0, url.lastIndexOf('/') + 1);
}

export function buildUrl(basePath: string, fileName: string): string {
    return `${basePath}${fileName}`;
}
