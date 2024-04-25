precision mediump float;
uniform vec3 u_camera;
varying vec4 v_normal;
varying vec4 v_position;
#define POINT_LIGHT 0
#define DIRECT_LIGHT 1

#define PI 3.14

struct Light {
  int lightType;
  vec3 color;
  vec3 position;
  float intencity;
};

vec3 diffusedBRDF(vec3 color, vec3 incomeLight) {
  vec3 diffusedColor = (color / PI) * dot(incomeLight, v_normal.xyz);

  return diffusedColor;
}

float normalDistribution(float halfV, float roughness) {
  float roughness2 = pow(roughness, 4.0);
  float d = pow(halfV, 2.0) * (roughness2 - 1.) + 1.;
  float normalDistribution = roughness2 / (PI * pow(d, 2.0));
  return normalDistribution;
}
float schlickGGX(float nDotV, float roughness) {
  float K = pow((roughness + 1.0), 2.0);
  float denominator = nDotV * (1.0 - K) + K;
  return nDotV / denominator;

}

vec3 fresnelSchlick(float cosTheta, vec3 F0) {
  return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}
vec3 specularBRDF(float nDotL, float nDotV, float roughness, vec3 F0) {
  vec3 top = normalDistribution(nDotL, roughness) * schlickGGX(nDotL, roughness) * fresnelSchlick(nDotL, F0);
  return top;
}

vec3 fresnelFactor(float ior) {
  return vec3(pow((ior - 1.), 2.0) / pow((ior + 1.), 2.0));

}

float lightAttenuation(Light light) {
  if(light.lightType == DIRECT_LIGHT) {
    return 1.0;
  }
  if(light.lightType == POINT_LIGHT) {
    float distanceSquared = distance(normalize(v_position.xyz), light.position);
    float attenuation = 1.0 + 1.0 * distanceSquared + 2.0 * distanceSquared * distanceSquared;
    return attenuation;

  }
  return 0.0;

}

void main() {
  Light lights[10];
  vec3 meshColor = vec3(1.0);
  lights[0] = Light(POINT_LIGHT, vec3(0.0, 1.0, 0.0), vec3(-.1, -.1, .2), 15.0);
  lights[1] = Light(DIRECT_LIGHT, vec3(1.0, 1., 1.0), vec3(1.0, 1.0, 1.0), 20.);
  lights[1] = Light(POINT_LIGHT, vec3(1.0, 1.0, 1.0), vec3(0.0, 0.0, 0.1), 5.);

  float metalicness = 0.9;
  float roughness = .1;
  float ior = 1.319;

  vec3 F0 = fresnelFactor(ior);

  vec3 N = normalize(v_normal.xyz);
  float nDotV = dot(N, u_camera);
  vec4 finalColor = vec4(0.0);

  for(int i = 0; i < 10; i++) {
    vec3 L = normalize(lights[i].position);
    float nDotL = max(dot(N, L), 0.001);
    vec3 diffusedLight = lights[i].color * diffusedBRDF(meshColor, lights[i].position) * (1. - metalicness);
    vec3 specularLight = lights[i].color * specularBRDF(nDotL, nDotV, roughness, F0);
    float lightIntencity = lights[i].intencity / lightAttenuation(lights[i]);
    vec4 color = vec4(((diffusedLight + specularLight) * lightIntencity * nDotL), 1.);
    finalColor = min(finalColor + color, vec4(1.0));
    finalColor = max(finalColor, vec4(0.0));

  }

  gl_FragColor = vec4(finalColor);

}
