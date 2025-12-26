export const gaussianBlur = `
  vec4 gaussianBlur(sampler2D img, vec2 uv, float blurSize, int kernelSize, vec2 resolution) {
    vec4 color = vec4(0.0);
    int halfKernelSize = kernelSize / 2;
    float sigma = float(kernelSize) / 2.;
    float weightSum = 0.0;
    for (int x = -halfKernelSize; x <= halfKernelSize; x++) {
      for (int y = -halfKernelSize; y <= halfKernelSize; y++) {
        vec2 offset = vec2(x, y) * blurSize / resolution;
        float weight = exp(-(float(x * x + y * y) / (2. * sigma * sigma))); 
        color += texture2D(img, uv + offset) * weight;
        weightSum += weight;
      }
    }
    return color / weightSum;  
  }
`;
