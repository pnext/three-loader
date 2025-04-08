precision highp float;
precision highp int;

uniform float opacity;
uniform bool renderIds;

in vec3 vColor;
in float vOpacity;
in vec2 vPosition;
in float backfaseCulling;
in vec2 vID;

out vec4 color_data;

void main() {

	float A = dot(vPosition, vPosition);
	if (A > 8.0) discard;
	
	float opacity = exp(-0.5 * A) * vOpacity;
	color_data = vec4(vColor, opacity);

	if(renderIds) {

		if(opacity < 0.1) discard;
		color_data = vec4(vID, 0., 1.);

	}

}
