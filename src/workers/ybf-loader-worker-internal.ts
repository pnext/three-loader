// @ts-nocheck
import {
  BufferGeometry, BufferAttribute
} from 'three'

const supportedVersions = ['0.0.3', '0.0.4', '0.0.5']

const types = {
  Uint32: {
    ArrayClass: Uint32Array,
    size: 4
  },
  Uint8: {
    ArrayClass: Uint8Array,
    size: 1
  },
  Float32: {
    ArrayClass: Float32Array,
    size: 4
  }
}

const parseHeader = (ybf) => {
  const headerMaxLength = Math.min(80, ybf.byteLength)
  const ybfHeader = String.fromCharCode.apply(null, new Uint8Array(ybf, 0, headerMaxLength)).split('\n')[0]
  const parsedHeader = ybfHeader.match(/Resonai YBF version: (?<version>\d\.\d\.\d).*/)
  const version = parsedHeader.groups.version
  if (!parsedHeader || !supportedVersions.includes(version)) {
    console.log('YBF Header: ', ybfHeader)
    throw new Error('Unknown or old YBF format => Not supported')
  }
  const numAttrs = (version === '0.0.5' ? 5 : 3)
  const attributesType = types.Uint32
  const positionsType = types.Float32
  const facesType = types.Uint32
  const colorsType = version === '0.0.3' ? types.Float32 : types.Uint8
  const uvType = types.Float32
  const textureType = types.Uint32
  let offset = (ybfHeader.length + 1) * types.Uint8.size
  if (offset % 4 !== 0) {
    console.error('ERROR: old YBT format, header is not aligned to 32bit memory, offset:', offset)
    ybf = ybf.slice((ybfHeader.length + 1) * types.Uint8.size)
    offset = 0
  }
  const headerLength = offset + (attributesType.size * numAttrs)
  const counts = new attributesType.ArrayClass(ybf, offset, numAttrs)
  offset += attributesType.size * numAttrs
  const positionsLength = counts[0] * positionsType.size
  const facesLength = counts[1] * facesType.size
  const colorsLength = counts[2] * colorsType.size
  const uvLength = (numAttrs === 5 ? counts[3] * uvType.size : 0)
  const textureLength = (numAttrs === 5 ? counts[4] * textureType.size : 0)
  if (!(counts[2] === 0 || counts[0] === counts[2]) || !(uvLength === 0 || counts[0] / 3 === counts[3] / 2) ||
    positionsLength + facesLength + colorsLength + uvLength + textureLength + headerLength !== ybf.byteLength) {
    throw new Error('Bad YBF format, might be corrupted or deprecated')
  }
  return {
    positionsType, facesType, colorsType, uvType, textureType, counts, headerLength: offset
  }
}

const parseAsBufferGeometry = (ybf, { polygon = false } = {}) => {
  let { positionsType, facesType, colorsType, uvType, textureType, counts, headerLength: offset } = parseHeader(ybf)
  const hasTextures = (counts.length === 5)
  const geometry = new BufferGeometry()
  let textureLengths = []
  if (hasTextures) {
    textureLengths = new textureType.ArrayClass(ybf, offset, counts[4])
    offset += counts[4] * textureType.size
  }
  const vertexPositions = new positionsType.ArrayClass(ybf, offset, counts[0])
  offset += counts[0] * positionsType.size
  const facesIndices = new facesType.ArrayClass(ybf, offset, counts[1])
  offset += counts[1] * facesType.size
  let uvs = []
  if (hasTextures) {
    uvs = new uvType.ArrayClass(ybf, offset, counts[3])
    offset += counts[3] * uvType.size
  }
  const vertexColors = new colorsType.ArrayClass(ybf, offset, counts[2])
  offset += counts[2] * colorsType.size
  const vertexPossitionsBuffer = new BufferAttribute(vertexPositions, 3)
  geometry.setAttribute('position', vertexPossitionsBuffer)
  if (counts[1] > 0) {
    // https://stackoverflow.com/a/28650798
    // Not sure why we use 1 here. 1 Works, 3 *sometimes* works.
    const facesIndicesBuffer = new BufferAttribute(facesIndices, 1)
    geometry.setIndex(facesIndicesBuffer)
  } else if (polygon) {
    const pos = geometry.attributes.position.array
    const vertices = []
    for (let i = 0; i < pos.length; i += 3) {
      vertices.push(pos[i], pos[i + 2]) // ignoring Y
    }
    const index = earcut(vertices)
    const indexBuffer = new BufferAttribute(Uint32Array.from(index), 1)
    geometry.setIndex(indexBuffer)
  }
  counts[2] && geometry.setAttribute('color', new BufferAttribute(vertexColors, 3, true))
  if (hasTextures && counts[3] > 0) {
    geometry.setAttribute('uv', new BufferAttribute(uvs, 2))
    let textureOffset = 0
    for (let i = 0; i < textureLengths.length; i++) {
      geometry.addGroup(textureOffset * 3, textureLengths[i] * 3, i)
      textureOffset += textureLengths[i]
    }
  }
  // geometry.computeVertexNormals()
  geometry.sourceType = 'ybf'
  return geometry
}

export async function handleMessage(event) {
  try {
    const geometry = parseAsBufferGeometry(event.data.buffer);
    const indices = new ArrayBuffer(geometry.attributes.position.count * 4);
    const iIndices = new Uint32Array(indices);
    for (let i = 0; i < geometry.attributes.position.count; i++) {
      iIndices[i] = i;
    }
    postMessage({
      indices,
      attributeBuffers: {
        position: { buffer: geometry.attributes.position.array },
        color: { buffer: geometry.attributes.color.array }
      }
    });
  } catch (e) {
    console.log(e);
    postMessage({ failed: true });
  }
}
