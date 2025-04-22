import { GetUrlFn, XhrRequest } from '../loading/types';
import { OctreeLoader } from './octree-loader';

export interface LoadOctreeOptions {
	loadHarmonics?: boolean,
	xhrRequest?: XhrRequest,
}
export async function loadOctree(
	url: string,
	getUrl: GetUrlFn,
	xhrRequest: XhrRequest,
	option?: LoadOctreeOptions
) {
	const trueUrl = await getUrl(url);
	const loader = new OctreeLoader(getUrl, url, option?.loadHarmonics ?? false);
	const { geometry } = await loader.load(trueUrl, xhrRequest);

	return geometry;
}
