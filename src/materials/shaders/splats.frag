precision highp float;
precision highp int;

uniform float opacity;
uniform bool renderIds;
uniform bool debugMode;

in vec3 vColor;
in float vOpacity;
in vec2 vPosition;
in float backfaseCulling;
in vec2 vID;

out vec4 color_data;

uvec3 murmurHash31(uint src) {
    const uint M = 0x5bd1e995u;
    uvec3 h = uvec3(1190494759u, 2147483647u, 3559788179u);
    src *= M; src ^= src>>24u; src *= M;
    h *= M; h ^= src;
    h ^= h>>13u; h *= M; h ^= h>>15u;
    return h;
}

// 3 outputs, 1 input
vec3 hash31(float src) {
    uvec3 h = murmurHash31(floatBitsToUint(src));
    return uintBitsToFloat(h & 0x007fffffu | 0x3f800000u) - 1.0;
}

void main() {

	float A = dot(vPosition, vPosition);
	if (A > 8.0) discard;
	
	float opacity = exp(-0.5 * A) * vOpacity;
	color_data = vec4(vColor, opacity);
	
	if(debugMode){
		if(opacity < 0.1) discard;
		color_data = vec4( hash31(vID.x), 1.);	
	}

	if(renderIds) {
		if(opacity < 0.1) discard;
		color_data = vec4(vID, 0., 1.);
	} 

}
