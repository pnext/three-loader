import { Color } from 'three';
import { IGradient } from '../types';

// From chroma spectral http://gka.github.io/chroma.js/
export const SPECTRAL: IGradient = [
  [0, new Color(0.3686, 0.3098, 0.6353)],
  [0.1, new Color(0.1961, 0.5333, 0.7412)],
  [0.2, new Color(0.4, 0.7608, 0.6471)],
  [0.3, new Color(0.6706, 0.8667, 0.6431)],
  [0.4, new Color(0.902, 0.9608, 0.5961)],
  [0.5, new Color(1.0, 1.0, 0.749)],
  [0.6, new Color(0.9961, 0.8784, 0.5451)],
  [0.7, new Color(0.9922, 0.6824, 0.3804)],
  [0.8, new Color(0.9569, 0.4275, 0.2627)],
  [0.9, new Color(0.8353, 0.2431, 0.3098)],
  [1, new Color(0.6196, 0.0039, 0.2588)],
];
