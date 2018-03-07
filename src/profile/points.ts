import { Box3 } from 'three';
import { IPoints, PointsData } from './types';

export class Points implements IPoints {
  numPoints: number = 0;
  boundingBox = new Box3();
  data: PointsData = {};

  add(points: IPoints) {
    const currentSize = this.numPoints;
    const additionalSize = points.numPoints;
    const newSize = currentSize + additionalSize;

    const thisAttributes = Object.keys(this.data);
    const otherAttributes = Object.keys(points.data);
    const attributes = new Set([...thisAttributes, ...otherAttributes]);

    attributes.forEach(attribute => {
      if (thisAttributes.includes(attribute) && otherAttributes.includes(attribute)) {
        // attribute in both, merge

        const Type = this.data[attribute].constructor;
        const merged = new Type(this.data[attribute].length + points.data[attribute].length);
        merged.set(this.data[attribute], 0);
        merged.set(points.data[attribute], this.data[attribute].length);

        this.data[attribute] = merged;
      } else if (thisAttributes.includes(attribute) && !otherAttributes.includes(attribute)) {
        // attribute only in this; take over this and expand to new size

        const Type = this.data[attribute].constructor;
        const elementsPerPoint = this.data[attribute].length / this.numPoints;
        const expanded = new Type(elementsPerPoint * newSize);
        expanded.set(this.data[attribute], 0);

        this.data[attribute] = expanded;
      } else if (!thisAttributes.includes(attribute) && otherAttributes.includes(attribute)) {
        // attribute only in points to be added; take over new points and expand to new size

        const Type = points.data[attribute].constructor;
        const elementsPerPoint = points.data[attribute].length / points.numPoints;
        const expanded = new Type(elementsPerPoint * newSize);
        expanded.set(points.data[attribute], elementsPerPoint * currentSize);

        this.data[attribute] = expanded;
      }
    });

    this.numPoints = newSize;

    this.boundingBox.union(points.boundingBox);
  }
}
