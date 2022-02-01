import { PointCloudOctreeGeometry } from '../point-cloud-octree-geometry';
import { GetUrlFn, XhrRequest } from './types';
/**
 *
 * @param url
 *    The url of the point cloud file (usually cloud.js).
 * @param getUrl
 *    Function which receives the relative URL of a point cloud chunk file which is to be loaded
 *    and shoud return a new url (e.g. signed) in the form of a string or a promise.
 * @param xhrRequest An arrow function for a fetch request
 * @returns
 *    An observable which emits once when the first LOD of the point cloud is loaded.
 */
export declare function loadPOC(url: string, getUrl: GetUrlFn, xhrRequest: XhrRequest): Promise<PointCloudOctreeGeometry>;
