export const getGroundY = `
  float getGroundY(float x, sampler2D data, vec2 dataSize) {
    int size = int(dataSize.x);
    float sampleIdx = x * float(size - 1);
    float i0 = floor(sampleIdx);
    float i1 = min(i0 + 1.0, float(size - 1));
    float f = fract(sampleIdx);
    float data0 = texture2D(data, vec2(i0 / float(size), 0.)).r;
    float data1 = texture2D(data, vec2(i1 / float(size), 0.)).r;
    float groundY = mix(data0, data1, f);
    return groundY;
  }
`;

export const drawGround = `
  vec4 drawGround(vec2 uv, float groundY, vec4 color) {
    float circle = smoothstep(0.003, 0.002, abs(uv.y - groundY));
    return vec4(color.rgb, color.a * max(circle, 0.0));
  }
`;
