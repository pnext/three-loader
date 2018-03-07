import { Vector4 } from 'three';
import { IClassification } from './types';

export const DEFAULT_CLASSIFICATION: IClassification = {
  0: new Vector4(0.5, 0.5, 0.5, 1.0),
  1: new Vector4(0.5, 0.5, 0.5, 1.0),
  2: new Vector4(0.63, 0.32, 0.18, 1.0),
  3: new Vector4(0.0, 1.0, 0.0, 1.0),
  4: new Vector4(0.0, 0.8, 0.0, 1.0),
  5: new Vector4(0.0, 0.6, 0.0, 1.0),
  6: new Vector4(1.0, 0.66, 0.0, 1.0),
  7: new Vector4(1.0, 0, 1.0, 1.0),
  8: new Vector4(1.0, 0, 0.0, 1.0),
  9: new Vector4(0.0, 0.0, 1.0, 1.0),
  12: new Vector4(1.0, 1.0, 0.0, 1.0),
  DEFAULT: new Vector4(0.3, 0.6, 0.6, 0.5),
};
