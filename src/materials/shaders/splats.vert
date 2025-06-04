precision highp float;
precision highp int;

in int indexes_sorted;

uniform vec2 focal;
uniform float inverseFocalAdjustment;
uniform float splatScale;
uniform vec2 basisViewport;
uniform float harmonicsDegree;
uniform bool renderIds;
uniform bool adaptiveSize;

uniform sampler2D covarianceTexture0;
uniform sampler2D covarianceTexture1;
uniform sampler2D nodeTexture;
uniform highp usampler2D posColorTexture;
uniform highp usampler2D nodeIndicesTexture;
uniform highp usampler2D harmonicsTexture1;
uniform highp usampler2D harmonicsTexture2;
uniform highp usampler2D harmonicsTexture3;

uniform highp usampler2D nodeTexture2;
uniform float fov;
uniform float spacing;
uniform float screenHeight;
uniform float maxSplatScale;


uniform bool renderOnlyHarmonics;
uniform float harmonicsScale;

//To read the LOD for each point
uniform highp usampler2D vnStartTexture;
uniform sampler2D visibleNodes;
uniform float octreeSize;

out vec3 vColor;
out float vOpacity;
out vec2 vPosition;
out float vZ;
out float backfaseCulling;
out vec2 vID;

const float sqrt8 = sqrt(8.0);
const float minAlpha = 1.0 / 255.0;


const vec4 encodeNorm4 = vec4(1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0);
const uvec4 mask4 = uvec4(uint(0x000000FF), uint(0x0000FF00), uint(0x00FF0000), uint(0xFF000000));
const uvec4 shift4 = uvec4(0, 8, 16, 24);
vec4 uintToRGBAVec (uint u) {
    uvec4 urgba = mask4 & u;
    urgba = urgba >> shift4;
    vec4 rgba = vec4(urgba) * encodeNorm4;
    return rgba;
}
vec3 unpack111011s(uint bits) { 
    vec3 result = vec3((uvec3(bits) >> uvec3(21u, 11u, 0u)) & uvec3(0x7ffu, 0x3ffu, 0x7ffu)) / vec3(2047.0, 1023.0, 2047.0); 
    return result * 2. - 1.;
}       
ivec2 getDataUVSplat(in int stride, in int offset, in vec2 dimensions, in int index) {
    ivec2 samplerUV = ivec2(0, 0);
    float d = float(uint(index) * uint(stride) + uint(offset));
    samplerUV.y = int(floor(d / dimensions.x));
    samplerUV.x = int(mod(d, dimensions.x));
    return samplerUV;
}

const float SH_C1 = 0.4886025119029199f;
const float[5] SH_C2 = float[](1.0925484, -1.0925484, 0.3153916, -1.0925484, 0.5462742);
const float[7] SH_C3 = float[](-0.5900435899266435, 
                                2.890611442640554, 
                                -0.4570457994644658, 
                                0.3731763325901154, 
                                -0.4570457994644658, 
                                1.445305721320277, 
                                -0.5900435899266435);

/**
 * Gets the number of 1-bits up to inclusive index position.
 *
 * number is treated as if it were an integer in the range 0-255
 */
int numberOfOnes(int number, int index) {
	int numOnes = 0;
	int tmp = 128;
	for (int i = 7; i >= 0; i--) {

		if (number >= tmp) {
			number = number - tmp;

			if (i <= index) {
				numOnes++;
			}
		}

		tmp = tmp / 2;
	}

	return numOnes;
}

/**
 * Checks whether the bit at index is 1.0
 *
 * number is treated as if it were an integer in the range 0-255
 */
bool isBitSet(int number, int index){

	// weird multi else if due to lack of proper array, int and bitwise support in WebGL 1.0
	int powi = 1;
	if (index == 0) {
		powi = 1;
	} else if (index == 1) {
		powi = 2;
	} else if (index == 2) {
		powi = 4;
	} else if (index == 3) {
		powi = 8;
	} else if (index == 4) {
		powi = 16;
	} else if (index == 5) {
		powi = 32;
	} else if (index == 6) {
		powi = 64;
	} else if (index == 7) {
		powi = 128;
	}

	int ndp = number / powi;

	return mod(float(ndp), 2.0) != 0.0;
}

/**
 * Gets the the LOD at the point position.
 */
float getLOD(vec3 pos, int vnStart, float level) {
	vec3 offset = vec3(0.0, 0.0, 0.0);
	int iOffset = vnStart;
	float depth = level;

	for (float i = 0.0; i <= 30.0; i++) {
		float nodeSizeAtLevel = octreeSize  / pow(2.0, i + level + 0.0);

		vec3 index3d = (pos-offset) / nodeSizeAtLevel;
		index3d = floor(index3d + 0.5);
		int index = int(round(4.0 * index3d.x + 2.0 * index3d.y + index3d.z));

		vec4 value = texture2D(visibleNodes, vec2(float(iOffset) / 2048.0, 0.0));
		int mask = int(round(value.r * 255.0));

		if (isBitSet(mask, index)) {
			// there are more visible child nodes at this position
			int advanceG = int(round(value.g * 255.0)) * 256;
			int advanceB = int(round(value.b * 255.0));
			int advanceChild = numberOfOnes(mask, index - 1);
			int advance = advanceG + advanceB + advanceChild;

			iOffset = iOffset + advance;

			depth++;
		} else {
			return value.a * 255.0; // no more visible child nodes at this position
		}

		offset = offset + (vec3(1.0, 1.0, 1.0) * nodeSizeAtLevel * 0.5) * index3d;
	}

	return depth;
}

float getPointSizeAttenuation(vec3 pos, int vnStart, float level) {
    return 0.5 * pow(2.0, getLOD(pos, vnStart, level));
}


void main() {

    ivec2 samplerUV = ivec2(0, 0);
    vec2 dim = vec2(textureSize(covarianceTexture0, 0).xy);
    float dd = float(indexes_sorted);
    samplerUV.y = int(floor(dd / dim.x));
    samplerUV.x = int(mod(dd, dim.x));

    vec4 cov3D_4 = texelFetch(covarianceTexture0, samplerUV, 0);
    vec2 cov3D_2 = texelFetch(covarianceTexture1, samplerUV, 0).rg;


    uvec4 sampledCenterColor = texelFetch(posColorTexture, samplerUV, 0);
    vec3 instancePosition = uintBitsToFloat(uvec3(sampledCenterColor.gba));

    uint nodeIndex = texelFetch(nodeIndicesTexture, samplerUV, 0).r;


    vID = vec2(indexes_sorted, nodeIndex);

    samplerUV = ivec2(0, 0);
    dd = float(nodeIndex);
    samplerUV.y = int(floor(dd / 100.));
    samplerUV.x = int(mod(dd, 100.));

    vec4 nodeData = texelFetch(nodeTexture, samplerUV, 0);

    ivec2 levelAndVnStart =  ivec2(texelFetch(nodeTexture2, samplerUV, 0).rg);
    int vnStart = levelAndVnStart.r;
    int level = levelAndVnStart.g;

    instancePosition += nodeData.rgb;

    vec4 viewCenter = modelViewMatrix * vec4(instancePosition, 1.0);
    vec4 clipCenter = projectionMatrix * viewCenter;
    vec3 ndcCenter = clipCenter.xyz / clipCenter.w;

    mat3 Vrk = mat3(
        cov3D_4.x, cov3D_4.y, cov3D_4.z,
        cov3D_4.y, cov3D_4.w, cov3D_2.x,
        cov3D_4.z, cov3D_2.x, cov3D_2.y
    );

    mat3 J;
    float s = 1.0 / (viewCenter.z * viewCenter.z);
    J = mat3(
        focal.x / viewCenter.z, 0., -(focal.x * viewCenter.x) * s,
        0., focal.y / viewCenter.z, -(focal.y * viewCenter.y) * s,
        0., 0., 0.
    );

    mat3 W = transpose(mat3(modelViewMatrix));
    mat3 T = W * J;

    mat3 cov2Dm = transpose(T) * Vrk * T;
    cov2Dm[0][0] += 0.3;
    cov2Dm[1][1] += 0.3;

    vec3 cov2Dv = vec3(cov2Dm[0][0], cov2Dm[0][1], cov2Dm[1][1]);

    float a = cov2Dv.x;
    float d = cov2Dv.z;
    float b = cov2Dv.y;
    float D = a * d - b * b;
    float trace = a + d;
    float traceOver2 = 0.5 * trace;
    float term2 = sqrt(max(0.1f, traceOver2 * traceOver2 - D));
    float eigenValue1 = traceOver2 + term2;
    float eigenValue2 = traceOver2 - term2;

    if (eigenValue2 <= 0.0) return;

    vec2 eigenVector1 = normalize(vec2(b, eigenValue1 - a));
    // since the eigen vectors are orthogonal, we derive the second one from the first
    vec2 eigenVector2 = vec2(eigenVector1.y, -eigenVector1.x);

    //Get the adaptive size
    float renderScale = 1.;

    if(adaptiveSize) {

        float slope = tan(fov / 2.0);
	    float projFactor =  -0.5 * screenHeight / (slope * viewCenter.z);
        float worldSpaceSize = 2.0 * spacing / getPointSizeAttenuation( instancePosition, vnStart, float(level) );
        renderScale = worldSpaceSize * projFactor;

        //the splats should be at least the default size.
        renderScale = max(1., renderScale);
        renderScale = min(renderScale, maxSplatScale);

    }

    float cameraDistance = length(cameraPosition - instancePosition);

    // We use sqrt(8) standard deviations instead of 3 to eliminate more of the splat with a very low opacity.
    vec2 basisVector1 = eigenVector1 * renderScale * min(sqrt8 * sqrt(eigenValue1), 1024.);
    vec2 basisVector2 = eigenVector2 * renderScale * min(sqrt8 * sqrt(eigenValue2), 1024.);

    vec2 ndcOffset = vec2(position.x * basisVector1 + position.y * basisVector2) *
                        basisViewport * 2.0 * inverseFocalAdjustment;

    vec4 quadPos = vec4(ndcCenter.xy + ndcOffset, ndcCenter.z, 1.0);
    vZ = ndcCenter.z;
    gl_Position = quadPos;

    vPosition = position.xy;
    vPosition *= sqrt8;

    vec4 colorData = uintToRGBAVec(sampledCenterColor.r);

    vColor = colorData.rgb;

    vec3 worldViewDir = normalize(instancePosition - cameraPosition);

    //Harmonics
    vec3 harmonics = vec3(0.);
    vec3 sh1 = vec3(0.);
    vec3 sh2 = vec3(0.);
    vec3 sh3 = vec3(0.);

    vec3 sh4 = vec3(0.);
    vec3 sh5 = vec3(0.);
    vec3 sh6 = vec3(0.);
    vec3 sh7 = vec3(0.);
    vec3 sh8 = vec3(0.);

    vec3 sh9 = vec3(0.);
    vec3 sh10 = vec3(0.);
    vec3 sh11 = vec3(0.);
    vec3 sh12 = vec3(0.);
    vec3 sh13 = vec3(0.);
    vec3 sh14 = vec3(0.);
    vec3 sh15 = vec3(0.);

    if(harmonicsDegree > 0. && !renderIds) {

        vec2 degree1TextureSize = vec2(textureSize(harmonicsTexture1, 0));

        uint d1 = texelFetch(harmonicsTexture1, getDataUVSplat(3, 0, degree1TextureSize, indexes_sorted), 0).r;
        uint d2 = texelFetch(harmonicsTexture1, getDataUVSplat(3, 1, degree1TextureSize, indexes_sorted), 0).r;
        uint d3 = texelFetch(harmonicsTexture1, getDataUVSplat(3, 2, degree1TextureSize, indexes_sorted), 0).r;

        sh1 = unpack111011s(d1);
        sh2 = unpack111011s(d2);
        sh3 = unpack111011s(d3);

        float x = worldViewDir.z;
        float y = worldViewDir.y;
        float z = worldViewDir.x;

        float xx = 1.;
        float yy = 1.;
        float zz = 1.;
        float xy = 1.;
        float yz = 1.;
        float xz = 1.;

        harmonics = SH_C1 * (-sh1 * y + sh2 * z - sh3 * x);

        if(harmonicsDegree > 1.) {

            vec2 degree2TextureSize = vec2(textureSize(harmonicsTexture2, 0));

            uint d4 = texelFetch(harmonicsTexture2, getDataUVSplat(5, 0, degree2TextureSize, indexes_sorted), 0).r;
            uint d5 = texelFetch(harmonicsTexture2, getDataUVSplat(5, 1, degree2TextureSize, indexes_sorted), 0).r;
            uint d6 = texelFetch(harmonicsTexture2, getDataUVSplat(5, 2, degree2TextureSize, indexes_sorted), 0).r;
            uint d7 = texelFetch(harmonicsTexture2, getDataUVSplat(5, 3, degree2TextureSize, indexes_sorted), 0).r;
            uint d8 = texelFetch(harmonicsTexture2, getDataUVSplat(5, 4, degree2TextureSize, indexes_sorted), 0).r;


            sh4 = unpack111011s(d4);
            sh5 = unpack111011s(d5);
            sh6 = unpack111011s(d6);
            sh7 = unpack111011s(d7);
            sh8 = unpack111011s(d8);


            xx = x * x;
            yy = y * y;
            zz = z * z;
            xy = x * y;
            yz = y * z;
            xz = x * z;

            harmonics += 
                (SH_C2[0] * xy) * sh4 +
                (SH_C2[1] * yz) * sh5 +
                (SH_C2[2] * (2.0 * zz - xx - yy)) * sh6 +
                (SH_C2[3] * xz) * sh7 +
                (SH_C2[4] * (xx - yy)) * sh8;

            if(harmonicsDegree > 2.) {

                vec2 degree3TextureSize = vec2(textureSize(harmonicsTexture3, 0));

                uint d9 =  texelFetch(harmonicsTexture3, getDataUVSplat(7, 0, degree3TextureSize, indexes_sorted), 0).r;
                uint d10 = texelFetch(harmonicsTexture3, getDataUVSplat(7, 1, degree3TextureSize, indexes_sorted), 0).r;
                uint d11 = texelFetch(harmonicsTexture3, getDataUVSplat(7, 2, degree3TextureSize, indexes_sorted), 0).r;
                uint d12 = texelFetch(harmonicsTexture3, getDataUVSplat(7, 3, degree3TextureSize, indexes_sorted), 0).r;
                uint d13 = texelFetch(harmonicsTexture3, getDataUVSplat(7, 4, degree3TextureSize, indexes_sorted), 0).r;
                uint d14 = texelFetch(harmonicsTexture3, getDataUVSplat(7, 5, degree3TextureSize, indexes_sorted), 0).r;
                uint d15 = texelFetch(harmonicsTexture3, getDataUVSplat(7, 6, degree3TextureSize, indexes_sorted), 0).r;

                sh9 =  unpack111011s(d9);
                sh10 = unpack111011s(d10);
                sh11 = unpack111011s(d11);
                sh12 = unpack111011s(d12);
                sh13 = unpack111011s(d13);
                sh14 = unpack111011s(d14);

                harmonics +=
                    SH_C3[0] * y * (3.0 * xx - yy) * sh9 +
                    SH_C3[1] * xy * z * sh10 +
                    SH_C3[2] * y * (4.0 * zz - xx - yy) * sh11 +
                    SH_C3[3] * z * (2.0 * zz - 3.0 * xx - 3.0 * yy) * sh12 +
                    SH_C3[4] * x * (4.0 * zz - xx - yy) * sh13 +
                    SH_C3[5] * z * (xx - yy) * sh14 +
                    SH_C3[6] * x * (xx - 3.0 * yy) * sh15;

            }
        }
    }

    if(renderOnlyHarmonics) {
        vColor = harmonicsScale * harmonics;
    } else {
        vColor += harmonics;
    }
    
    vColor.rgb = clamp(vColor.rgb, vec3(0.), vec3(1.));

/*
    //Test the LOD
    int LOD = int(getLOD( instancePosition, int(vnStart), float(level) ));
    switch ( LOD ) {
        case 0:
            vColor.rgb = vec3(1., 0., 0.);
        break;
        case 1:
            vColor.rgb = vec3(0., 1., 0.);
        break;
        case 2:
            vColor.rgb = vec3(0., 0., 1.);
        break;
        case 3:
            vColor.rgb = vec3(1., 0., 1.);
        break;
        case 4:
            vColor.rgb = vec3(1., 1., 0.);
        break;
        case 5:
            vColor.rgb = vec3(0., 1., 1.);
        break;
        case 6:
            vColor.rgb = vec3(0.5, 0., 0.);
        break;
        case 7:
            vColor.rgb = vec3(0., 0.5, 0.);
        break;
        case 8:
            vColor.rgb = vec3(0.0, 0., 0.5);
        break;
        case 9:
            vColor.rgb = vec3(0.5, 0., 0.5);
        break;
        case 10:
            vColor.rgb = vec3(0.5, 0.5, 0.0);
        break;
        case 11:
            vColor.rgb = vec3(0.0, 0.5, 0.5);
        break;
        case 12:
            vColor.rgb = vec3(1., 1., 1.);
        break;
    }
    */

	vOpacity = colorData.a;
}
