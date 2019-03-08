import { Box3, Vector2, Vector3 } from 'three';

export class DEMNode {
  level: number;
  data: Float32Array;
  children: DEMNode[];
  mipMap: Float32Array[];
  mipMapNeedsUpdate: boolean = true;

  constructor(public name: string, public box: Box3, public tileSize: number) {
    this.level = this.name.length - 1;
    this.data = new Float32Array(tileSize * tileSize);
    this.data.fill(-Infinity);
    this.children = [];

    this.mipMap = [this.data];
  }

  createMipMap() {
    this.mipMap = [this.data];

    let sourceSize = this.tileSize;
    let mipSize = sourceSize / 2;
    let mipSource = this.data;
    while (mipSize > 1) {
      const mipData = new Float32Array(mipSize * mipSize);

      for (let i = 0; i < mipSize; i++) {
        for (let j = 0; j < mipSize; j++) {
          const h00 = mipSource[2 * i + 0 + 2 * j * sourceSize];
          const h01 = mipSource[2 * i + 0 + 2 * j * sourceSize + sourceSize];
          const h10 = mipSource[2 * i + 1 + 2 * j * sourceSize];
          const h11 = mipSource[2 * i + 1 + 2 * j * sourceSize + sourceSize];

          let [height, weight] = [0, 0];

          if (isFinite(h00)) {
            height += h00;
            weight += 1;
          }
          if (isFinite(h01)) {
            height += h01;
            weight += 1;
          }
          if (isFinite(h10)) {
            height += h10;
            weight += 1;
          }
          if (isFinite(h11)) {
            height += h11;
            weight += 1;
          }

          height = height / weight;

          // let hs = [h00, h01, h10, h11].filter(h => isFinite(h));
          // let height = hs.reduce( (a, v, i) => a + v, 0) / hs.length;

          mipData[i + j * mipSize] = height;
        }
      }

      this.mipMap.push(mipData);

      mipSource = mipData;
      sourceSize = mipSize;
      mipSize = Math.floor(mipSize / 2);
    }

    this.mipMapNeedsUpdate = false;
  }

  uv(position: Vector2): [number, number] {
    const boxSize = new Vector3();
    this.box.getSize(boxSize);

    const u = (position.x - this.box.min.x) / boxSize.x;
    const v = (position.y - this.box.min.y) / boxSize.y;

    return [u, v];
  }

  heightAtMipMapLevel(position: Vector2, mipMapLevel: number) {
    const uv = this.uv(position);

    const tileSize = Math.floor(this.tileSize / Math.floor(2 ** mipMapLevel));
    const data = this.mipMap[mipMapLevel];

    const i = Math.min(uv[0] * tileSize, tileSize - 1);
    const j = Math.min(uv[1] * tileSize, tileSize - 1);

    const a = i % 1;
    const b = j % 1;

    const [i0, i1] = [Math.floor(i), Math.ceil(i)];
    const [j0, j1] = [Math.floor(j), Math.ceil(j)];

    const h00 = data[i0 + tileSize * j0];
    const h01 = data[i0 + tileSize * j1];
    const h10 = data[i1 + tileSize * j0];
    const h11 = data[i1 + tileSize * j1];

    let wh00 = isFinite(h00) ? (1 - a) * (1 - b) : 0;
    let wh01 = isFinite(h01) ? (1 - a) * b : 0;
    let wh10 = isFinite(h10) ? a * (1 - b) : 0;
    let wh11 = isFinite(h11) ? a * b : 0;

    const wsum = wh00 + wh01 + wh10 + wh11;
    wh00 = wh00 / wsum;
    wh01 = wh01 / wsum;
    wh10 = wh10 / wsum;
    wh11 = wh11 / wsum;

    if (wsum === 0) {
      return null;
    }

    let h = 0;

    if (isFinite(h00)) {
      h += h00 * wh00;
    }
    if (isFinite(h01)) {
      h += h01 * wh01;
    }
    if (isFinite(h10)) {
      h += h10 * wh10;
    }
    if (isFinite(h11)) {
      h += h11 * wh11;
    }

    return h;
  }

  height(position: Vector2) {
    let h = null;

    for (let i = 0; i < this.mipMap.length; i++) {
      h = this.heightAtMipMapLevel(position, i);

      if (h !== null) {
        return h;
      }
    }

    return h;
  }

  traverse(handler: (node: DEMNode, level: number) => void, level = 0) {
    handler(this, level);

    this.children.filter(c => c !== undefined).forEach(child => child.traverse(handler, level + 1));
  }
}
