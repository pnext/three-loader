precision highp float;
precision highp int;

uniform float opacity;

varying vec3 vColor;
varying float vOpacity;

void main() {
	vec3 color = vColor;
	gl_FragColor = vec4(color, vOpacity);

}
