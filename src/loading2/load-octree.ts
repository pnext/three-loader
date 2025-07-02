import { GetUrlFn, XhrRequest } from '../loading/types';
import { OctreeLoader } from './octree-loader';

export async function loadOctree(
  url: string,
  getUrl: GetUrlFn,
  xhrRequest: XhrRequest,
  loadHarmonics: boolean = false,
) {
  const trueUrl = await getUrl(url);
  const loader = new OctreeLoader(getUrl, url, loadHarmonics);
  const { geometry } = await loader.load(trueUrl, xhrRequest);

  return geometry;
}
