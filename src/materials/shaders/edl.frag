// Number of neighboring pixels to sample for EDL
#define NEIGHBOUR_COUNT 8

// Screen dimensions for scaling radius
uniform float screenWidth;
uniform float screenHeight;

// Offsets for sampling neighboring pixels
uniform vec2 neighbours[NEIGHBOUR_COUNT];

// EDL parameters
uniform float edlStrength; // Controls shading intensity
uniform float radius;      // Sampling radius
uniform float opacity;     // Final pixel opacity

// Camera near/far planes for depth linearization
uniform float near;
uniform float far;

// Input textures
uniform sampler2D colorMap; // Rendered scene color
uniform sampler2D depthMap; // Depth buffer

// UV coordinates from vertex shader
varying vec2 vUv;



// Converts non-linear depth to linear depth

float linearizeDepth(float depth) {
    if (isOrthographic) {
        // For orthographic cameras, depth is already linear
        return depth * (far - near) + near;
    } else {
        // Perspective depth linearization
        float z = depth * 2.0 - 1.0;
        return (2.0 * near * far) / (far + near - z * (far - near));
    }
}



float response(float centerDepth) {
    vec2 uvRadius = radius / vec2(screenWidth, screenHeight);
    float sum = 0.0;
    float weightSum = 0.0;

    for (int i = 0; i < NEIGHBOUR_COUNT; i++) {
        
        vec2 uvNeighbor = vUv + uvRadius * neighbours[i];
        float neighborRaw = texture2D(depthMap, uvNeighbor).r;


        float neighborDepth = linearizeDepth(neighborRaw);

        if (neighborDepth >= far * 0.99) continue;

        float diff = abs(centerDepth - neighborDepth);
        float weight = 1.0 / (1.0 + diff); // Emphasize close depth differences

        sum += diff * weight;
        weightSum += weight;
    }

    return sum / weightSum;
}

void main() {
    vec4 color = texture2D(colorMap, vUv);
    float centerDepth = linearizeDepth(texture2D(depthMap, vUv).r);

    float contrast = response(centerDepth); // Local depth contrast
    float edgeStrength = clamp(contrast * edlStrength, 0.0, 1.0);
//    gl_FragColor = vec4(vec3(edgeStrength), 1.0);

    vec3 finalColor = mix(color.rgb, vec3(0.0), edgeStrength);

    gl_FragColor = vec4(finalColor, opacity);
}

