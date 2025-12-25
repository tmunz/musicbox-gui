export const getGroundY = `
  float getGroundY(float x, float aspectRatio, sampler2D data, vec2 volumeDataSize) {
    float leftEdge = -0.5 * aspectRatio;
    float rightEdge = 0.5 * aspectRatio;
    float totalWidth = rightEdge - leftEdge;
    int volumeCount = int(volumeDataSize.x);
    float t = clamp((rightEdge - x) / totalWidth, 0.0, 1.0);
    float sampleIdx = t * float(volumeCount - 1);
    float i0 = floor(sampleIdx);
    float i1 = min(i0 + 1.0, float(volumeCount - 1));
    float f = fract(sampleIdx);
    float data0 = texture2D(data, vec2(i0 / float(volumeCount), 0.)).r;
    float data1 = texture2D(data, vec2(i1 / float(volumeCount), 0.)).r;
    float volume = mix(data0, data1, f);
    return volume;
  }
`;

export const drawGround = `
  vec4 drawGround(float y, float groundY) {
    float circle = smoothstep(0.003, 0.002, abs(y - groundY));
    return vec4(1.0, 1.0, 1.0, circle > 0.0 ? circle : 0.0);
  }
`;
