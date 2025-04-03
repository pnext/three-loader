import {
  CanvasTexture,
  ClampToEdgeWrapping,
  Color,
  DataTexture,
  FloatType,
  LinearFilter,
  NearestFilter,
  RGBAFormat,
  Texture,
  UVMapping,
} from 'three';
import { IClassification, IGradient } from '../materials/types';

export function generateDataTexture(width: number, height: number, color: Color): Texture {
  const size = width * height;
  const data = new Uint8Array(4 * size);

  const r = Math.floor(color.r * 255);
  const g = Math.floor(color.g * 255);
  const b = Math.floor(color.b * 255);

  for (let i = 0; i < size; i++) {
    data[i * 3] = r;
    data[i * 3 + 1] = g;
    data[i * 3 + 2] = b;
  }

  const texture = new DataTexture(data, width, height, RGBAFormat);
  texture.needsUpdate = true;
  texture.magFilter = NearestFilter;

  return texture;
}

export function generateGradientTexture(gradient: IGradient): Texture {
  const size = 64;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext('2d')!;

  context.rect(0, 0, size, size);
  const ctxGradient = context.createLinearGradient(0, 0, size, size);

  for (let i = 0; i < gradient.length; i++) {
    const step = gradient[i];
    ctxGradient.addColorStop(step[0], `#${step[1].getHexString()}`);
  }

  context.fillStyle = ctxGradient;
  context.fill();

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;

  texture.minFilter = LinearFilter;
  // textureImage = texture.image;

  return texture;
}

export function generateClassificationTexture(classification: IClassification): Texture {
  const width = 256;
  const height = 256;
  const size = width * height;

  const data = new Uint8Array(4 * size);

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const i = x + width * y;

      let color;
      if (classification[x]) {
        color = classification[x];
      } else if (classification[x % 32]) {
        color = classification[x % 32];
      } else {
        color = classification.DEFAULT;
      }

      data[4 * i + 0] = 255 * color.x;
      data[4 * i + 1] = 255 * color.y;
      data[4 * i + 2] = 255 * color.z;
      data[4 * i + 3] = 255 * color.w;
    }
  }

  const texture = new DataTexture(data, width, height, RGBAFormat);
  texture.magFilter = NearestFilter;
  texture.needsUpdate = true;

  return texture;
}

export function generateClipboxTexture(): DataTexture {
  const width = 256;
  const height = 256;
  const size = width * height;

  const data = new Float32Array(size * 4);

  const texture = new DataTexture(data, width, height, RGBAFormat, FloatType, UVMapping, ClampToEdgeWrapping, ClampToEdgeWrapping, NearestFilter, NearestFilter);
  texture.needsUpdate = true;

  return texture;
}
