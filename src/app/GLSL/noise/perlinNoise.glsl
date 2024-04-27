precision mediump float;

uniform vec2 u_resolution;
varying vec2 v_texcoord;
varying vec4 v_normal;
vec2 randomGradient(vec2 p) {
  p = p + 0.02;
  float x = dot(p, vec2(123.4, 234.5));
  float y = dot(p, vec2(234.5, 345.6));
  vec2 gradient = vec2(x, y);
  gradient = sin(gradient);
  gradient = gradient * 43758.5453;

  gradient = sin(gradient );
  return gradient;
}


vec2 quintic(vec2 p) {
  return p * p * p * (10.0 + p * (-15.0 + p * 6.0));
}

float perlinNoise(vec2 texcoord, float scale)
{

 vec2 uv = texcoord*scale;

  vec3 black = vec3(0.0);
  vec3 white = vec3(1.0);
  vec3 color = black;

  vec2 gridId = floor(uv);
  vec2 gridUv = fract(uv);
  color = vec3(gridId, 0.0);
  color = vec3(gridUv, 0.0);

  vec2 bl = gridId + vec2(0.0, 0.0);
  vec2 br = gridId + vec2(1.0, 0.0);
  vec2 tl = gridId + vec2(0.0, 1.0);
  vec2 tr = gridId + vec2(1.0, 1.0);

  vec2 gradBl = randomGradient(bl);
  vec2 gradBr = randomGradient(br);
  vec2 gradTl = randomGradient(tl);
  vec2 gradTr = randomGradient(tr);

  vec2 distFromPixelToBl = gridUv - vec2(0.0, 0.0);
  vec2 distFromPixelToBr = gridUv - vec2(1.0, 0.0);
  vec2 distFromPixelToTl = gridUv - vec2(0.0, 1.0);
  vec2 distFromPixelToTr = gridUv - vec2(1.0, 1.0);

  float dotBl = dot(gradBl, distFromPixelToBl);
  float dotBr = dot(gradBr, distFromPixelToBr);
  float dotTl = dot(gradTl, distFromPixelToTl);
  float dotTr = dot(gradTr, distFromPixelToTr);


  gridUv = quintic(gridUv);

  float b = mix(dotBl, dotBr, gridUv.x);
  float t = mix(dotTl, dotTr, gridUv.x);
  float perlin = mix(b, t, gridUv.y);

  // color = vec3(perlin + 0.2);
return perlin;

}
float billowNoise(vec2 uv ,float scale)
{
    return abs(perlinNoise(uv,scale));


}

float ridgedNoise(vec2 uv ,float scale)
{
    float noise = 1.0- billowNoise(uv,scale); 
    return abs(noise*noise);


}
void main() {
  // vec3 color = perlinNoise(v_texcoord, 10.0);
  vec3 normal = v_normal.xyz;
vec2  uv = gl_FragCoord.xy/u_resolution;
 
  gl_FragColor =  vec4(vec3(perlinNoise(uv, 10.0)), 1.0);
}