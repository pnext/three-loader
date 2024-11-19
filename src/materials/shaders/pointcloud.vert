precision highp float;
precision highp int;

attribute vec3 position;  

attribute vec3 instancePosition;
attribute vec4 instanceRotation;
attribute vec3 instanceScale;
attribute vec4 instanceColor;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec3 vColor;
varying float vOpacity;

vec3 rotateVectorByQuaternion(vec3 v, vec4 q) {
    vec3 t = 2.0 * cross(q.xyz, v);
    return v + q.w * t + cross(q.xyz, t);
}

void main() {

    vec3 scaledPosition = position * instanceScale;
    vec3 rotatedPosition = rotateVectorByQuaternion(scaledPosition, instanceRotation);
    vec3 transformedPosition = rotatedPosition + instancePosition;
    vec4 mvPosition = modelViewMatrix * vec4(transformedPosition, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    vColor = vec3(instanceColor.rgb) / 255.0; 
	vOpacity = instanceColor.a / 255.0;
}
