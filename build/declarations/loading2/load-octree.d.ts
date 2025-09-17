import { GetUrlFn, XhrRequest } from '../loading/types';
export declare function loadOctree(
  url: string,
  getUrl: GetUrlFn,
  xhrRequest: XhrRequest,
  loadHarmonics?: boolean,
): Promise<import('./octree-geometry').OctreeGeometry>;
