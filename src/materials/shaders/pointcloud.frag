precision highp float;
precision highp int;

uniform float opacity;

varying vec3 vColor;

void main() {
	vec3 color = vColor;
	gl_FragColor = vec4(color, opacity);

}
