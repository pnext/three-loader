// -------------------------------------------------------------------------------------------------
// Converted to Typescript and adapted from https://github.com/potree/potree
// -------------------------------------------------------------------------------------------------

import { Box3, Vector3 } from 'three';
import { PointAttributes, PointAttributeStringName } from '../point-attributes';
import { PointCloudOctreeGeometry } from '../point-cloud-octree-geometry';
import { PointCloudOctreeGeometryNode } from '../point-cloud-octree-geometry-node';
import { createChildAABB } from '../utils/bounds';
import { getIndexFromName } from '../utils/utils';
import { Version } from '../version';
import { BinaryLoader } from './binary-loader';
import { GetUrlFn, XhrRequest } from './types';
import { gsToPath } from '../utils/utils';

interface BoundingBoxData {
  lx: number;
  ly: number;
  lz: number;
  ux: number;
  uy: number;
  uz: number;
}

interface POCJson {
  version: string;
  octreeDir: string;
  projection: string;
  points: number;
  boundingBox: BoundingBoxData;
  tightBoundingBox?: BoundingBoxData;
  pointAttributes: PointAttributeStringName[];
  spacing: number;
  scale: number;
  hierarchyStepSize: number;
  hierarchy: [string, number][]; // [name, numPoints][]
}

/**
 *
 * @param url
 *    The url of the point cloud file (usually cloud.js).
 * @param getUrl
 *    Function which receives the relative URL of a point cloud chunk file which is to be loaded
 *    and should return a new url (e.g. signed) in the form of a string or a promise.
 * @param xhrRequest An arrow function for a fetch request
 * @returns
 *    An observable which emits once when the first LOD of the point cloud is loaded.
 */
export function loadPOC(
  url: string,
  getUrl: GetUrlFn,
  xhrRequest: XhrRequest,
): Promise<PointCloudOctreeGeometry> {
  console.log('loadPOC', url)
  return Promise.resolve(getUrl(url)).then(transformedUrl => {
    return xhrRequest(transformedUrl, { mode: 'cors' })
      .then(res => res.json())
      .then(parse(transformedUrl, getUrl, xhrRequest));
  });
}

export function loadResonaiPOC(
  url: string,
  getUrl: GetUrlFn,
  xhrRequest: XhrRequest,
): Promise<PointCloudOctreeGeometry> {
  console.log('loadResonaiPOC', url)
  return xhrRequest(gsToPath(url), { mode: 'cors' })
    .then(res => res.json())
    .then(parseResonai(gsToPath(url), getUrl, xhrRequest));
}

function parse(url: string, getUrl: GetUrlFn, xhrRequest: XhrRequest) {
  return (data: POCJson): Promise<PointCloudOctreeGeometry> => {
    const { offset, boundingBox, tightBoundingBox } = getBoundingBoxes(data);

    const loader = new BinaryLoader({
      getUrl,
      version: data.version,
      boundingBox,
      scale: data.scale,
      xhrRequest,
    });

    const pco = new PointCloudOctreeGeometry(
      loader,
      boundingBox,
      tightBoundingBox,
      offset,
      xhrRequest,
    );

    pco.url = url;
    pco.octreeDir = data.octreeDir;
    pco.needsUpdate = true;
    pco.spacing = data.spacing;
    pco.hierarchyStepSize = data.hierarchyStepSize;
    pco.projection = data.projection;
    pco.offset = offset;
    pco.pointAttributes = new PointAttributes(data.pointAttributes);

    const nodes: Record<string, PointCloudOctreeGeometryNode> = {};

    const version = new Version(data.version);

    return loadRoot(pco, data, nodes, version).then(() => {
      if (version.upTo('1.4')) {
        loadRemainingHierarchy(pco, data, nodes);
      }

      pco.nodes = nodes;
      return pco;
    });
  };
}

/*
{
  "version": "1.7",
  "octreeDir": "data",
  "boundingBox": {
    "lx": -0.748212993144989,
    "ly": -2.78040599822998,
    "lz": 2.54782128334045,
    "ux": 3.89967638254166,
    "uy": 1.86748337745667,
    "uz": 7.1957106590271
  },
  "tightBoundingBox": {
    "lx": -0.748212993144989,
    "ly": -2.78040599822998,
    "lz": 2.55100011825562,
    "ux": 2.4497377872467,
    "uy": 1.48934376239777,
    "uz": 7.1957106590271
  },
  "pointAttributes": [
    "POSITION_CARTESIAN",
    "COLOR_PACKED",
    "NORMAL_SPHEREMAPPED"
  ],
  "spacing": 0.0750000029802322,
  "scale": 0.001,
  "hierarchyStepSize": 6
}
*/

function parseResonai(url: string, getUrl: GetUrlFn, xhrRequest: XhrRequest) {
  return (data: POCJson): Promise<PointCloudOctreeGeometry> => {
    console.log('parseResonai', data);
    const { offset, boundingBox, tightBoundingBox } = getResonaiBoundingBoxes(data);

    const loader = new BinaryLoader({
      getUrl,
      version: data.version,
      boundingBox,
      scale: 1,
      xhrRequest,
    });

    const pco = new PointCloudOctreeGeometry(
      loader,
      boundingBox,
      tightBoundingBox,
      offset,
      xhrRequest,
    );

    pco.url = url;
    pco.octreeDir = data.octreeDir;
    pco.needsUpdate = true;
    pco.spacing = data.spacing;
    pco.hierarchyStepSize = data.hierarchyStepSize;
    pco.projection = data.projection;
    pco.offset = offset;
    pco.pointAttributes = new PointAttributes(data.pointAttributes);

    const nodes: Record<string, PointCloudOctreeGeometryNode> = {};

    const version = new Version(data.version);

    return loadRoot(pco, data, nodes, version).then(() => {
      if (version.upTo('1.4')) {
        loadRemainingHierarchy(pco, data, nodes);
      }

      pco.nodes = nodes;
      return pco;
    });
  };
}

function getBoundingBoxes(
  data: POCJson,
): { offset: Vector3; boundingBox: Box3; tightBoundingBox: Box3 } {
  const min = new Vector3(data.boundingBox.lx, data.boundingBox.ly, data.boundingBox.lz);
  const max = new Vector3(data.boundingBox.ux, data.boundingBox.uy, data.boundingBox.uz);
  const boundingBox = new Box3(min, max);
  const tightBoundingBox = boundingBox.clone();

  const offset = min.clone();

  if (data.tightBoundingBox) {
    const { lx, ly, lz, ux, uy, uz } = data.tightBoundingBox;
    tightBoundingBox.min.set(lx, ly, lz);
    tightBoundingBox.max.set(ux, uy, uz);
  }

  boundingBox.min.sub(offset);
  boundingBox.max.sub(offset);
  tightBoundingBox.min.sub(offset);
  tightBoundingBox.max.sub(offset);

  return { offset, boundingBox, tightBoundingBox };
}

function getResonaiBoundingBoxes(
  data: any, // TODO(Shai) implement interface?
): { offset: Vector3; boundingBox: Box3; tightBoundingBox: Box3 } {
  const min = new Vector3(...data.min_bounding_box)
  const max = min.clone().addScalar(data.scale);
  const boundingBox = new Box3(min, max);
  const tightBoundingBox = boundingBox.clone();

  const offset = min.clone();

  boundingBox.min.sub(offset);
  boundingBox.max.sub(offset);
  tightBoundingBox.min.sub(offset);
  tightBoundingBox.max.sub(offset);

  return { offset, boundingBox, tightBoundingBox };
}

function loadRoot(
  pco: PointCloudOctreeGeometry,
  data: POCJson,
  nodes: Record<string, PointCloudOctreeGeometryNode>,
  version: Version,
): Promise<void> {
  const name = 'r';

  const root = new PointCloudOctreeGeometryNode(name, pco, pco.boundingBox);
  root.hasChildren = true;
  root.spacing = pco.spacing;

  if (version.upTo('1.5')) {
    root.numPoints = data.hierarchy[0][1];
  } else {
    root.numPoints = 0;
  }

  pco.root = root;
  nodes[name] = root;
  return pco.root.load();
}

function loadRemainingHierarchy(
  pco: PointCloudOctreeGeometry,
  data: POCJson,
  nodes: Record<string, PointCloudOctreeGeometryNode>,
): void {
  for (let i = 1; i < data.hierarchy.length; i++) {
    const [name, numPoints] = data.hierarchy[i];
    const { index, parentName, level } = parseName(name);
    const parentNode = nodes[parentName];

    const boundingBox = createChildAABB(parentNode.boundingBox, index);
    const node = new PointCloudOctreeGeometryNode(name, pco, boundingBox);
    node.level = level;
    node.numPoints = numPoints;
    node.spacing = pco.spacing / Math.pow(2, node.level);

    nodes[name] = node;
    parentNode.addChild(node);
  }
}

function parseName(name: string): { index: number; parentName: string; level: number } {
  return {
    index: getIndexFromName(name),
    parentName: name.substring(0, name.length - 1),
    level: name.length - 1,
  };
}
