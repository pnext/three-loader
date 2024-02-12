import {GetUrlFn, XhrRequest} from '../loading/types';
import {OctreeLoader} from './OctreeLoader';

export async function loadOctree(
	url: string,
	getUrl: GetUrlFn,
	xhrRequest: XhrRequest,
) {
	const trueUrl = await getUrl(url);
	const loader = new OctreeLoader();
	const {geometry} = await loader.load(trueUrl, xhrRequest);

	return geometry;
}
