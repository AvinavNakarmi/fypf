import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SceneService } from '../scene/scene.service';

@Injectable({
  providedIn: 'root'
})
export class TextureService {
  metalicness:Subject<number> =new Subject();
  roughness:Subject<number> =new Subject();
  IOR:Subject<number> =new Subject();


metal:number=0.1;
 rough:number=0.1;
  ior:number=1.319; 
  




  constructor( private sceneService:SceneService) { 
    

  }
getVertexShader()
{
  const vertexShader =
  `
  attribute vec2 a_texCoord;
  
  attribute vec3 normal;
  
precision mediump float;
uniform mat4 modelMatrix; 
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 Matrix;
varying vec4 v_normal;
varying vec4 v_position;

varying vec2 v_texCoord;



attribute vec3 position;
void main() {
  v_normal =projectionMatrix*viewMatrix*modelMatrix*vec4(normalize(normal), 1.0);
  v_position=projectionMatrix*viewMatrix*modelMatrix*vec4(position, 1.0);
  v_texCoord = a_texCoord;

    gl_Position = projectionMatrix*viewMatrix*modelMatrix* vec4(position, 1.0);    }
`;
return vertexShader;
 
}
getFragmentShader()
{
  const fragmentShader= `
  #define PI 3.14
  #define POINT_LIGHT 0
  #define DIRECT_LIGHT 1

  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;


  uniform vec3 lightColor [10];
  uniform int lightType [10];
  uniform vec3 lightPosition[10];
  uniform float lightIntencity[10];
  uniform int u_numLights;
  uniform int image;
   
  varying vec4 v_normal;
  varying vec4 v_position;

  struct Light {
    int lightType;
    vec3 color;
    vec3 position;
    float intencity;
  };

  vec3 diffusedBRDF(vec3 color, vec3 incomeLight,vec3 N) {
    vec3 diffusedColor = (color / PI) * dot(incomeLight, N.xyz); 
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
vec3 meshColor = vec3(1.0);
float metalicness = float(${this.metal});
float roughness = float(${this.rough});
float ior = float(${this.ior});

vec3 camera = vec3(0.0,0.0,5.0);
vec3 F0 = fresnelFactor(ior);
vec3 N = normalize(v_normal.xyz);
float nDotV = dot(N, camera);
vec4 finalColor = vec4(0.0);
Light lights[10];

const int MAX_LIGHTS = 10;

for(int i = 0; i <  MAX_LIGHTS; i++) {
  if (i == u_numLights) {
    break; 
}
 
  if( lightType[i]==0)
  {
    lights[i] = Light(POINT_LIGHT, lightColor[i].xyz/255.0, lightPosition[i].xyz/10.0, lightIntencity[i]/5.0);     
  }
  else
  {
    lights[i] = Light(DIRECT_LIGHT, lightColor[i].xyz/255.0, lightPosition[i],lightIntencity[i]);
  

  }
  }

for(int i = 0; i <  MAX_LIGHTS; i++) {
  if (i == u_numLights) {
    break; // Break the loop if we've reached the actual number of lights
}
  vec3 L = normalize(lights[i].position);
  float nDotL = max(dot(N, L), 0.001);
  vec3 diffusedLight = lights[i].color * diffusedBRDF(meshColor, lights[i].position,N) * (1. - metalicness);
  vec3 specularLight = lights[i].color * specularBRDF(nDotL, nDotV, roughness, F0);
  float lightIntencity = lights[i].intencity / lightAttenuation(lights[i]);
  vec4 color = vec4(((diffusedLight + specularLight) * lightIntencity * nDotL), 1.);
  finalColor = min(finalColor + color, vec4(1.0));
  finalColor = max(finalColor, vec4(0.0));
}
if(image==1)
{
  gl_FragColor =finalColor*texture2D(u_image, v_texCoord);
}
else
{
  gl_FragColor = vec4(finalColor);

}
}

  `;
  return fragmentShader;
}

  
  addRoughness()
  {
    return `roughness = float(${this.rough});`;
  }
  addMetalicness()
  {
    return ` metalicness  = float(${this.metal});`;
  }
 
  addIOR()
  {
    return ` ior = float(${this.ior});`;
  }
  
  setRoughness(value:number)
  {
    
    this.rough=value;
    this.sceneService.setShader(this.getFragmentShader(),"frag");
    this.sceneService.createProgram(true);
    console.log("rough",value);
    
  }
  setMetalicness(value:number)
  {
    this.metal=value;
    this.sceneService.setShader(this.getFragmentShader(),"frag");
    this.sceneService.createProgram(true);
    console.log("metal",value);

  }
 
  setIOR(value:number)
  {
    
    this.ior=value;
    this.sceneService.setShader(this.getFragmentShader(),"frag");
    this.sceneService.createProgram(true);

    console.log("ior",value);



  }

}
