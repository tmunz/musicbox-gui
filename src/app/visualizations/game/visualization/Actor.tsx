export const drawActor = `
  const float PI = 3.14159265359;

  float cross2d(vec2 a, vec2 b) {
    return a.x * b.y - a.y * b.x;
  }

  float sdfQuadraticBezier(vec2 p, vec2 a, vec2 c, vec2 b) {
    vec2 ab = b - a;
    vec2 ac = c - a;
    vec2 cb = b - c;
    float t = clamp(dot(p - a, ab) / dot(ab, ab), 0.0, 1.0);
    vec2 pt = mix(mix(a, c, t), mix(c, b, t), t);
    return length(p - pt);
  }

  float sdfPolygon(vec2 p, vec2 points[6], float bendFactors[6]) {
    float minDist = 1e10;
    float winding = 0.0;
    int N = 6;
    int SUBDIV = 8; // Number of subdivisions per edge for winding
    for (int i = 0; i < N; i++) {
      vec2 a = points[i];
      vec2 b = points[(i + 1) % N];
      vec2 e = b - a;
      vec2 mid = (a + b) * 0.5;
      vec2 perp = normalize(vec2(-e.y, e.x));
      vec2 c = mid + perp * bendFactors[i] * length(e);
      float dist = sdfQuadraticBezier(p, a, c, b);
      if (dist < minDist) minDist = dist;
      vec2 prev = a;
      for (int j = 1; j <= SUBDIV; j++) {
        float t = float(j) / float(SUBDIV);
        vec2 pt = mix(mix(a, c, t), mix(c, b, t), t);
        float angle = atan(pt.y - p.y, pt.x - p.x) - atan(prev.y - p.y, prev.x - p.x);
        if (angle > PI) angle -= 2.0 * PI;
        if (angle < -PI) angle += 2.0 * PI;
        winding += angle;
        prev = pt;
      }
    }
    float sign = (abs(winding) > PI) ? -1.0 : 1.0;
    return minDist * sign;
  }

  float getBody(vec2 uv, vec2 position, vec2 leftFootPosition, vec2 rightFootPosition, vec2 headPosition) {
    float footThickness = 0.01;
    float headThickness = 0.04;
    float footDistanceFactor = 1.;
    float headDistanceFactor = 0.5;
    vec2 points[6];
    bool leftIsLower = leftFootPosition.x < rightFootPosition.x;
    vec2 lowerFoot = leftIsLower ? leftFootPosition : rightFootPosition;
    vec2 higherFoot = leftIsLower ? rightFootPosition : leftFootPosition;
    vec2 dirLower = normalize(lowerFoot - position);
    vec2 perpLower = vec2(-dirLower.y, dirLower.x);
    vec2 dirHigher = normalize(higherFoot - position);
    vec2 perpHigher = vec2(-dirHigher.y, dirHigher.x);
    vec2 dirHead = normalize(headPosition - position);
    vec2 perpHead = vec2(-dirHead.y, dirHead.x);
    points[0] = mix(lowerFoot - perpLower * 2. * footThickness, position, 1. - footDistanceFactor);
    points[1] = mix(headPosition + perpHead * headThickness, position, 1. - headDistanceFactor);
    points[2] = mix(headPosition - perpHead * headThickness, position, 1. - headDistanceFactor);
    points[3] = mix(higherFoot, position, 1. - footDistanceFactor);
    points[4] = mix(higherFoot - perpHigher * 2. * footThickness, position, 1. - footDistanceFactor);
    points[5] = mix(lowerFoot, position, 1. - footDistanceFactor);
    float bendFactors[6] = float[](-0.1, -0.2, 0.05, -0.1, -0.5, -0.1);
    return sdfPolygon(uv, points, bendFactors);
  }

  float sdfEllipse(vec2 position, vec2 radii, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    mat2 rot = mat2(c, s, -s, c);
    vec2 pr = rot * position;
    return length(pr / radii) - 1.0;
  }

  float drawEllipse(vec2 uv, vec2 position, vec2 radii, float angle) {
    return sdfEllipse(uv - position, radii, angle);
  }

  vec4 blendOver(vec4 top, vec4 bottom) {
    float outAlpha = top.a + bottom.a * (1.0 - top.a);
    vec3 outColor = (top.rgb * top.a + bottom.rgb * bottom.a * (1.0 - top.a)) / (outAlpha + 1e-6);
    return vec4(outColor, outAlpha);
  }

  vec4 blendObject(vec4 current, float obj, float borderThickness, vec4 fillColor, vec3 borderColor, float mask) {
    float fill = step(obj, 0.0);
    if (fill > 0.0) {
      current = blendOver(fillColor * fill, current);
    }
    if (obj > 0.0) {
      float border = smoothstep(borderThickness, borderThickness - 0.002, abs(obj));
      float maskedBorder = border * mask;
      if (maskedBorder > 0.0) {
        current = blendOver(vec4(borderColor, maskedBorder), current);
      }
    }
    return current;
  }

  vec2 getFootPosition(float phase) {
    return vec2(sin(phase) * 0.075, -0.0375 + max(0.0, sin(phase + PI / 2.0)) * 0.05 + 0.05);
  }

  vec2 getBodyPosition(float phase) {
    return vec2(0.0, 0.15 + sin(phase * 2.0) * 0.005);
  }

  vec2 getHeadPosition(float phase) {
    return vec2(0.0, 0.25 + sin(phase * 2.0) * 0.0075);
  }

  vec4 drawActor(vec2 uv, float time, float speed, float focusY) {
    float phase = time * speed;
    float borderThicknessEllipse = 0.12;
    float borderThicknessBody = 0.006;
    vec4 fillColor = vec4(0., 1., 0., 1.);
    vec3 borderColor = vec3(1.);
    vec2 headPosition = getHeadPosition(phase);
    vec2 leftFootPosition = getFootPosition(phase);
    vec2 rightFootPosition = getFootPosition(phase + PI);
    float body = getBody(uv, getBodyPosition(phase), leftFootPosition, rightFootPosition, headPosition);
    float leftFootAngle = clamp(0.2 * sin(phase + 1.8), -0., 0.3);
    float rightFootAngle = clamp(0.2 * sin(phase + 1.8 + PI), -0., 0.3);
    float head = drawEllipse(uv, headPosition, vec2(0.045, 0.035), -focusY);
    float leftFoot = drawEllipse(uv, leftFootPosition, vec2(0.04, 0.03), leftFootAngle);
    float rightFoot = drawEllipse(uv, rightFootPosition, vec2(0.04, 0.03), rightFootAngle);
    vec4 color = vec4(0.0);
    color = blendObject(color, body, borderThicknessBody, fillColor, borderColor, 1.0 - max(max(step(leftFoot, 0.0), step(rightFoot, 0.0)), step(head, 0.0)));
    color = blendObject(color, leftFoot, borderThicknessEllipse, fillColor, borderColor, 1.0 - step(body, 0.0));
    color = blendObject(color, head, borderThicknessEllipse, fillColor, borderColor, 1.0 - step(body, 0.0));
    color = blendObject(color, rightFoot, borderThicknessEllipse, fillColor, borderColor, 1.0 - step(body, 0.0));
    return color;
  }
`;