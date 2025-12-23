export const drawActor = `
  const float PI = 3.14159265359;

  vec2 getFootAnimation(float phase) {
    float x = sin(phase) * 0.075;
    float y = max(0.0, sin(phase + PI / 2.0)) * 0.05;
    return vec2(x, y);
  }

  float drawFoot(vec2 uv, float phase) {
    vec2 anim = getFootAnimation(phase);
    return sdfCircle(uv - vec2(anim.x, -0.0375 + anim.y + 0.05), 0.0375);
  }

  vec2 getBodyAnimation(float phase) {
    float y = sin(phase * 2.0) * 0.005;
    return vec2(0.0, 0.15 + y);
  }

  float drawBody(vec2 uv, float phase) {
    vec2 anim = getBodyAnimation(phase);
    return sdfCircle(uv - anim, 0.1);
  }

  vec2 getHeadAnimation(float phase) {
    float y = sin(phase * 2.0) * 0.0075;
    return vec2(0.0, 0.275 + y);
  }

  float drawHead(vec2 uv, float phase) {
    vec2 anim = getHeadAnimation(phase);
    return sdfCircle(uv - anim, 0.045);
  }

  vec4 blendOver(vec4 top, vec4 bottom) {
    float outAlpha = top.a + bottom.a * (1.0 - top.a);
    vec3 outColor = (top.rgb * top.a + bottom.rgb * bottom.a * (1.0 - top.a)) / (outAlpha + 1e-6);
    return vec4(outColor, outAlpha);
  }

  vec4 blendObject(vec4 current, float obj, float borderThickness, vec3 fillColor, vec3 borderColor, float mask) {
    float fill = step(obj, 0.0);
    if (fill > 0.0) {
      current = blendOver(vec4(fillColor, fill), current);
    }
    if (obj > 0.0) {
      float border = smoothstep(borderThickness, borderThickness - 0.005, abs(obj));
      float maskedBorder = border * mask;
      if (maskedBorder > 0.0) {
        current = blendOver(vec4(borderColor, maskedBorder), current);
      }
    }
    return current;
  }

  vec4 drawActor(vec2 uv, float time, float speed) {
    if (uv.y < -0.002) {
      return vec4(0.0);
    }
    float phase = time * speed;
    float borderThickness = 0.0075;
    vec3 fillColor = vec3(0.0, 1.0, 0.0);
    vec3 borderColor = vec3(1.0);
    float body = drawBody(uv, phase);
    float head = drawHead(uv, phase);
    float leftFoot = drawFoot(uv, phase);
    float rightFoot = drawFoot(uv, phase + PI);
    vec4 color = vec4(0.0);
    color = blendObject(color, leftFoot, borderThickness, fillColor, borderColor, 1.0 - step(body, 0.0));
    color = blendObject(color, rightFoot, borderThickness, fillColor, borderColor, 1.0 - step(body, 0.0));
    color = blendObject(color, head, borderThickness, fillColor, borderColor, 1.0 - step(body, 0.0));
    color = blendObject(color, body, borderThickness, fillColor, borderColor, (1.0 - step(leftFoot, 0.0)) * (1.0 - step(rightFoot, 0.0)) * (1.0 - step(head, 0.0)));
    return color;
  }
`;