import { Box3, Vector2 } from 'three';
export declare class DEMNode {
    name: string;
    box: Box3;
    tileSize: number;
    level: number;
    data: Float32Array;
    children: DEMNode[];
    mipMap: Float32Array[];
    mipMapNeedsUpdate: boolean;
    constructor(name: string, box: Box3, tileSize: number);
    createMipMap(): void;
    uv(position: Vector2): [number, number];
    heightAtMipMapLevel(position: Vector2, mipMapLevel: number): number | null;
    height(position: Vector2): number | null;
    traverse(handler: (node: DEMNode, level: number) => void, level?: number): void;
}
