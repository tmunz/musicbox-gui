export const drawActor = `
  const float PI = 3.14159265359;

  struct Shape {
    vec2 pos;
    float angle;
    float sdf;
  };

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

  float sdfPolygon(vec2 p, vec2 points[6], vec2 bendFactors[6]) {
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
      vec2 c = mid + perp * bendFactors[i].x * length(e);
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

  float sdfEllipse(vec2 position, vec2 radii, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    mat2 rot = mat2(c, s, -s, c);
    vec2 pr = rot * position;
    return length(pr / radii) - 1.0;
  }

  vec4 blendOver(vec4 top, vec4 bottom) {
    float outAlpha = top.a + bottom.a * (1.0 - top.a);
    vec3 outColor = (top.rgb * top.a + bottom.rgb * bottom.a * (1.0 - top.a)) / (outAlpha + 1e-6);
    return vec4(outColor, outAlpha);
  }

  vec4 blendObject(vec4 current, float obj, float borderThickness, vec4 fillColor, vec4 borderColor, float mask) {
    float fill = step(obj, 0.0);
    if (fill > 0.0) {
      current = blendOver(fillColor * fill, current);
    }
    if (obj > 0.0) {
      float border = smoothstep(borderThickness, borderThickness - 0.002, abs(obj));
      float maskedBorder = border * mask;
      if (maskedBorder > 0.0) {
        current = blendOver(vec4(borderColor.rgb, maskedBorder), current);
      }
    }
    return current;
  }

  float getGroundYAtX(float x, sampler2D groundData, vec2 groundDataSize, float yOffset, float aspectRatio) {
    float xTex = (x / aspectRatio) + 0.5;
    return getGroundY(xTex, groundData, groundDataSize) + yOffset;
  }

  float sdfBody(vec2 uv, vec2 position, vec2 leftFootPosition, vec2 rightFootPosition, vec2 headPosition) {
    float footThickness = 0.01;
    float headThickness = 0.035;
    float footDistanceFactor = 0.9;
    float headDistanceFactor = 0.35;
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
    vec2 bendFactors[6];
    bendFactors[0] = vec2(-0.25, 0.0);
    bendFactors[1] = vec2(-0.1, 0.0);
    bendFactors[2] = vec2(2. * higherFoot.x, 0.0);
    bendFactors[3] = vec2(-0.1, 0.0);
    bendFactors[4] = vec2(-0.3, 0.0);
    bendFactors[5] = vec2(-0.1, 0.0);
    return sdfPolygon(uv, points, bendFactors);
  }

  vec2 getFootGroundPosition(float phase, sampler2D groundData, vec2 groundDataSize, float yOffset, float aspectRatio) {
    float x = sin(phase) * 0.075;
    float groundY = getGroundYAtX(x, groundData, groundDataSize, yOffset, aspectRatio);
    return vec2(x, groundY);
  }

  Shape makeFoot(vec2 uv, vec2 groundPos, float phase) {
    Shape s;
    float angleOffset = (mod(phase, 2.0 * PI) < PI) ? 1.8 : 1.8 + PI;
    float yArch = sin(-0.5 + phase + PI / 2.0);
    if (groundPos.x > 0.0) {
      yArch = pow(yArch, 1.5) * 1.7;
    }
    s.pos = vec2(groundPos.x, max(0.0, yArch * 0.06) + groundPos.y);
    s.angle = clamp(-0.9 * sin(phase + angleOffset), -1.0, 0.0);
    s.sdf = sdfEllipse(uv - s.pos, vec2(0.03, 0.02), s.angle);
    return s;
  }

  Shape makeHead(vec2 uv, float phase, float y, float focusValue, float mainValue) {
    Shape s;
    s.pos = vec2((mainValue - 0.3) * 0.1, y + sin(phase * 2.0) * 0.002);
    s.angle = 2. * focusValue;
    float ellipseSdf = sdfEllipse(uv - s.pos, vec2(0.045, 0.035), s.angle);
    vec2 eyePos = s.pos + vec2(0.035 * cos(s.angle - 0.7), -0.01 * sin(s.angle - 0.7));
    float lineThickness = 0.002;
    float lineLength = 0.004;
    float eyeSdf = max(abs(uv.x - eyePos.x) - lineThickness, abs(uv.y - eyePos.y) - lineLength);
    s.sdf = max(ellipseSdf, -eyeSdf);
    return s;
  }

  Shape makeBody(vec2 uv, float phase, float y, vec2 leftFootPos, vec2 rightFootPos, vec2 headPos) {
    Shape s;
    s.pos = vec2(0.0, 0.45 + sin(phase * 2.0) * 0.005);
    s.pos.y = y;
    s.angle = 0.0;
    s.sdf = sdfBody(uv, s.pos, leftFootPos, rightFootPos, headPos);
    return s;
  }

  float makeHair(vec2 uv, Shape head, vec4 lineColor, vec4 color) {
    float angle = head.angle + 0.6;
    vec2 dir = vec2(sin(angle), cos(angle));
    float hairLength = 0.025;
    vec2 hairStart = head.pos + dir * 0.042;
    float t = clamp(dot(uv - hairStart, dir) / hairLength, 0.0, 1.0);
    float curveAmount = -0.01 * t * (1.0 - t);
    vec2 perp = vec2(-dir.y, dir.x);
    float beat = head.pos.x * 20.;
    vec2 hairCurve = hairStart + dir * hairLength * t + perp * curveAmount * beat;
    float hairDist = length(uv - hairCurve);
    float baseWidth = 0.003;
    float tipWidth = 0.002;
    float width = mix(baseWidth, tipWidth, t);
    return smoothstep(width, width * 0.7, hairDist);
  }

  vec4 drawActor(
    vec2 uv, float time, vec4 lineColor, vec4 fillColor,
    vec2 groundUv, sampler2D groundData, vec2 groundDataSize, float yOffset, float aspectRatio, float currentVolume, float minVolume, float maxVolume
  ) {
    float speed = 460.0 * aspectRatio / groundDataSize.x;
    float phase = 0.9 + time * speed;
    float mainValue = getGroundYAtX(aspectRatio * (1.0 - 0.5), groundData, groundDataSize, yOffset, aspectRatio);
    vec2 leftFootGround = getFootGroundPosition(phase, groundData, groundDataSize, yOffset, aspectRatio);
    vec2 rightFootGround = getFootGroundPosition(phase + PI, groundData, groundDataSize, yOffset, aspectRatio);
    vec2 baseGround = (leftFootGround + rightFootGround) * 0.5;
    Shape leftFoot = makeFoot(uv, leftFootGround, phase);
    Shape rightFoot = makeFoot(uv, rightFootGround, phase + PI);
    Shape head = makeHead(uv, phase, baseGround.y + 0.22, baseGround.y - mainValue, (currentVolume - minVolume) / (maxVolume - minVolume));
    Shape body = makeBody(uv, phase, baseGround.y + 0.12, leftFoot.pos, rightFoot.pos, head.pos);
    vec4 color = vec4(0.0);
    color = blendObject(color, body.sdf, 0.006, fillColor, lineColor, 1.0 - max(max(step(leftFoot.sdf, 0.0), step(rightFoot.sdf, 0.0)), step(head.sdf, 0.0)));
    color = blendObject(color, leftFoot.sdf, 0.18, fillColor, lineColor, 1.0 - step(body.sdf, 0.0));
    color = blendObject(color, head.sdf, 0.12, fillColor, lineColor, 1.0 - step(body.sdf, 0.0));
    color = blendObject(color, rightFoot.sdf, 0.18, fillColor, lineColor, 1.0 - step(body.sdf, 0.0));
    color = blendOver(vec4(lineColor.rgb, makeHair(uv, head, lineColor, color)), color);
    return color;
  }
`;