const canvas = document.createElement('canvas');
const gl: WebGLRenderingContext | null = canvas.getContext('webgl');

export const FEATURES = {
  SHADER_INTERPOLATION: hasExtension('EXT_frag_depth') && hasMinVaryingVectors(8),
  SHADER_SPLATS:
    hasExtension('EXT_frag_depth') && hasExtension('OES_texture_float') && hasMinVaryingVectors(8),
  SHADER_EDL: hasExtension('OES_texture_float') && hasMinVaryingVectors(8),
  precision: getPrecision(),
};

function hasExtension(ext: string) {
  return gl !== null && Boolean(gl.getExtension(ext));
}

function hasMinVaryingVectors(value: number) {
  return gl !== null && gl.getParameter(gl.MAX_VARYING_VECTORS) >= value;
}

function getPrecision() {
  if (gl === null) {
    return '';
  }

  const vsHighpFloat = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT);
  const vsMediumpFloat = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT);

  const fsHighpFloat = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
  const fsMediumpFloat = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT);

  const highpAvailable =
    vsHighpFloat && fsHighpFloat && vsHighpFloat.precision > 0 && fsHighpFloat.precision > 0;

  const mediumpAvailable =
    vsMediumpFloat &&
    fsMediumpFloat &&
    vsMediumpFloat.precision > 0 &&
    fsMediumpFloat.precision > 0;

  return highpAvailable ? 'highp' : mediumpAvailable ? 'mediump' : 'lowp';
}
