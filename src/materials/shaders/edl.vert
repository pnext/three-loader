// Pass UV coordinates to the fragment shader
precision highp float;
precision highp int;


varying vec2 vUv;

void main() {
    // Store the UV coordinates for use in the fragment shader
    vUv = uv;

    // Transform the vertex position from model space to view space
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // Project the vertex into clip space
    gl_Position = projectionMatrix * mvPosition;
}