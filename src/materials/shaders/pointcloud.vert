precision highp float;
precision highp int;

attribute vec3 position;       // Quad vertices
attribute vec3 instancePosition; // Per-instance position

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec3 vColor;

void main() {
    vec3 transformedPosition = position + instancePosition; // Offset quad by instance position
    vec4 mvPosition = modelViewMatrix * vec4(transformedPosition, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    vColor = vec3(1.0, 1.0, 1.0); // Placeholder color
}
