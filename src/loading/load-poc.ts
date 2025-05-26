// -------------------------------------------------------------------------------------------------
// Converted to Typescript and adapted from https://github.com/potree/potree
// -------------------------------------------------------------------------------------------------

import { Box3, Vector3 } from 'three';
import { PointAttributes, PointAttributeStringName } from '../point-attributes';
import { PointCloudOctreeGeometry } from '../point-cloud-octree-geometry';
import { PointCloudOctreeGeometryNode } from '../point-cloud-octree-geometry-node';
import { createChildAABB } from '../utils/bounds';
import { getIndexFromName, handleFailedRequest } from '../utils/utils';
import { Version } from '../version';
import { BinaryLoader } from './binary-loader';
import { GetUrlFn, XhrRequest } from './types';
import { LasLazLoader } from './lazlaz/las-laz-loader';

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
  pointAttributes: PointAttributeStringName[] | 'LAS' | 'LAZ';
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
 *    and shoud return a new url (e.g. signed) in the form of a string or a promise.
 * @param xhrRequest An arrow function for a fetch request
 * @returns
 *    An observable which emits once when the first LOD of the point cloud is loaded.
 */
export function loadPOC(
  url: string,
  getUrl: GetUrlFn,
  xhrRequest: XhrRequest,
): Promise<PointCloudOctreeGeometry> {
  return Promise.resolve(getUrl(url)).then(transformedUrl => {
    return xhrRequest(transformedUrl, { mode: 'cors' })
      .then(res => handleFailedRequest(res))
      .then(okRes => okRes.json())
      .then(parse(transformedUrl, getUrl, xhrRequest));
  });
}

function parse(url: string, getUrl: GetUrlFn, xhrRequest: XhrRequest) {
  return (data: POCJson): Promise<PointCloudOctreeGeometry> => {
    const { offset, boundingBox, tightBoundingBox } = getBoundingBoxes(data);

    let loader = getLoader(data, getUrl, xhrRequest, boundingBox);
    let pointAttributes = getPointAttributes(data.pointAttributes);

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
    pco.pointAttributes = new PointAttributes(pointAttributes as PointAttributeStringName[]);

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

function getLoader(data: POCJson, getUrl: GetUrlFn, xhrRequest: XhrRequest, boundingBox: Box3) {
  let loader;

  if (typeof data.pointAttributes === 'string' && data.pointAttributes === 'LAS') {
    loader = new LasLazLoader({
      getUrl,
      extension: 'las',
      version: data.version,
      boundingBox,
      scale: data.scale,
      xhrRequest,
    });
  } else if (typeof data.pointAttributes === 'string' && data.pointAttributes === 'LAZ') {
    loader = new LasLazLoader({
      getUrl,
      extension: 'laz',
      version: data.version,
      boundingBox,
      scale: data.scale,
      xhrRequest,
    });
  } else {
    loader = new BinaryLoader({
      getUrl,
      version: data.version,
      boundingBox,
      scale: data.scale,
      xhrRequest,
    });
  }

  return loader;
}

function getPointAttributes(pointAttributes: PointAttributeStringName[] | 'LAS' | 'LAZ') {
  const isLasLaz =
    typeof pointAttributes === 'string' && (pointAttributes === 'LAS' || pointAttributes === 'LAZ');

  return isLasLaz ? defaultLasLazAttributes() : pointAttributes;
}

function getBoundingBoxes(
  data: POCJson,
): {
  offset: Vector3;
  boundingBox: Box3;
  tightBoundingBox: Box3;
} {
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

function defaultLasLazAttributes() {
  return [
    'RGBA_PACKED',
    'INTENSITY',
    'CLASSIFICATION',
    'GPS_TIME',
    'NUMBER_OF_RETURNS',
    'RETURN_NUMBER',
    'SOURCE_ID',
  ] as PointAttributeStringName[];
}
