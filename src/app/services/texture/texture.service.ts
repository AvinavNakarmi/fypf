import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SceneService } from '../scene/scene.service';
import { TextureType } from 'src/app/enum/texture-type';
import { TextureModel } from 'src/app/model/texture.model';

@Injectable({
  providedIn: 'root',
})
export class TextureService {
  metalicness: Subject<number> = new Subject();
  roughness: Subject<number> = new Subject();
  IOR: Subject<number> = new Subject();

  metal: string = 'float(0.5)';
  rough: string = 'float(0.1)';
  color: string = 'vec3(1.0)';
  normal: string = 'normalize(v_normal.xyz)';


  ior: number = 1.319;

  constructor(private sceneService: SceneService) {}
  getVertexShader() {
    const vertexShader = `
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
  getFragmentShader() {
    const fragmentShader = `
  #define PI 3.14
  #define POINT_LIGHT 0
  #define DIRECT_LIGHT 1

  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;  
  uniform sampler2D u_roughnessImageTexture;
  uniform sampler2D u_colorImageTexture;
  uniform sampler2D u_normalImageTexture;
  uniform sampler2D u_metalImageTexture;



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
  
float whiteNoise(vec2 p)
{
    float random = dot(p,vec2(12.,78.));
    random = sin(random);
    random =random* 43758.5453;
    random =fract(random);
    return random;
}
float valueNoise(vec2 uv)
{
    vec2 gridUV = fract(uv);
    vec2 gridID = floor(uv);
    gridUV =smoothstep(0.0,1.0, gridUV);



vec3 color =vec3(gridUV,0.0);
float bottomLeft = whiteNoise(gridID);
float bottomRight = whiteNoise(gridID+vec2(1.0,0.0));
float topLeft = whiteNoise(gridID+vec2(0.0,1.0));
float topRight = whiteNoise(gridID+ vec2(1.0,1.0));

float bottom  = mix(bottomLeft,bottomRight,gridUV.x); 
float top  = mix(topLeft,topRight,gridUV.x); 

float valueNoise = mix(bottom,top,gridUV.y); 




    return valueNoise;
}
float layeredValueNoise(vec2 uv, int itter,float scale )
{
  uv=uv* scale;
 float layeredValue = 0.0;
    float uvMultiplier =2.0;
    float uvsubtractor =1.0;

    for(int i=0;i<=10 ;i++)
    {
        if(itter<=i)
        {
            break;
        }
        uvMultiplier*=2.0;
        uvsubtractor/=2.0;

        layeredValue += valueNoise(uv*uvMultiplier)*uvsubtractor; 

    }
    return layeredValue;


}

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

  vec3 black = vec3(0.9);
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

vec3 calculateNormals(vec2 uv, int textureIndex,float scale ,float upper ,float lower)
{
  float diff= 0.0001;
  float height = .0001;
  float p1=1.0 ;
  float p2=1.0 ;
  float p3=1.0 ;
  float p4=1.0 ;
  
  if(textureIndex ==1)
  {
   p1 = perlinNoise((uv +vec2(diff,0.0)),scale);
   p2 = perlinNoise((uv -vec2(diff,0.0)),scale);
   p3 = perlinNoise((uv +vec2(0.0,diff)),scale);
   p4 = perlinNoise((uv -vec2(0.0,diff)),scale);
    
  }
  if(textureIndex ==3)
  {
   p1 = billowNoise((uv +vec2(diff,0.0)),scale);
   p2 = billowNoise((uv -vec2(diff,0.0)),scale);
   p3 = billowNoise((uv +vec2(0.0,diff)),scale);
   p4 = billowNoise((uv -vec2(0.0,diff)),scale);
    
  }if(textureIndex ==2)
  {
   p1 = ridgedNoise((uv +vec2(diff,0.0)),scale);
   p2 = ridgedNoise((uv -vec2(diff,0.0)),scale);
   p3 = ridgedNoise((uv +vec2(0.0,diff)),scale);
   p4 = ridgedNoise((uv -vec2(0.0,diff)),scale);
    
  }
  if(upper<lower)
    {
      p1= clamp(1.0-p1, upper,lower);
      p2= clamp(1.0-p2, upper,lower);  
      p3= clamp(1.0-p3, upper,lower);  
      p4= clamp(1.0-p4, upper,lower);  
    }  
    else
    {
     
      p1= clamp(p1, lower,upper);
      p2= clamp(p2, lower,upper);  
      p3= clamp(p3, lower,upper);  
      p4= clamp(p4, lower,upper);  
    
    }
  
  vec3 normal = normalize(vec3(p1-p2,p3-p4,height));
  return normal;

}
vec3 calculateNormals(vec2 uv,float scale,int  itter,float upper ,float lower)
{
  float diff= 0.0001;
  float height = .0001;
   float p1 = layeredValueNoise((uv +vec2(diff,0.0)),itter,scale);
   float p2 = layeredValueNoise((uv -vec2(diff,0.0)),itter,scale);
   float p3 = layeredValueNoise((uv +vec2(0.0,diff)),itter,scale);
   float p4 = layeredValueNoise((uv -vec2(0.0,diff)),itter,scale);
    
   if(upper<lower)
    {
      p1= clamp(1.0-p1, upper,lower);
      p2= clamp(1.0-p2, upper,lower);  
      p3= clamp(1.0-p3, upper,lower);  
      p4= clamp(1.0-p4, upper,lower);  
    }  
    else
    {
     
      p1= clamp(p1, lower,upper);
      p2= clamp(p2, lower,upper);  
      p3= clamp(p3, lower,upper);  
      p4= clamp(p4, lower,upper);  
    
    }
  vec3 normal = normalize(vec3(p1-p2,p3-p4,height));
  return normal;

}
vec3 calculateNormals2(vec2 uv,float p1,float p2,float p3,float p4)
{
  float diff= 0.0001;
  float height = .0001;
  // float p1 = perlinNoise((uv +vec2(diff,0.0)),20.0);
  // float p2 = perlinNoise((uv -vec2(diff,0.0)),20.0);
  // float p3 = perlinNoise((uv +vec2(0.0,diff)),20.0);
  // float p4 = perlinNoise((uv -vec2(0.0,diff)),20.0);
  vec3 normal = normalize(vec3(p1-p2,p3-p4,height));
  return normal;

}

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
  float RGBtoBW(vec3 color )
  {
    return  (0.21*color.r)+(0.72*color.g)+(0.7* color.b);  
  }
  
  float RGBtoBW(vec4 color)
  {
    return  (0.21*color.r)+(0.72*color.g)+(0.7* color.b);  
  }
void main() {
vec3 meshColor = ${this.color};
float metalicness = ${this.metal};
float roughness = ${this.rough};
float ior = float(${this.ior});

vec3 camera = vec3(0.0,0.0,5.0);
vec3 F0 = fresnelFactor(ior);
vec3 N = ${this.normal};
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
  gl_FragColor = vec4(finalColor.xyz* RGBtoBW(texture2D(u_image, v_texCoord)),1.0);
}
else
{
  // gl_FragColor = vec4(finalColor);
  gl_FragColor = vec4(vec3(meshColor),1.0);

}
}

  `;
    return fragmentShader;
  }

  setRoughness(value: string) {
    this.rough = value;
    this.sceneService.setShader(this.getFragmentShader(), 'frag');
    this.sceneService.createProgram(true);
    console.log('rough', value);
  }
  setNormal(value: string) {
    this.normal = value;
    this.sceneService.setShader(this.getFragmentShader(), 'frag');
    this.sceneService.createProgram(true);
  }
  setColor(value: string) {
    this.color = value;
    this.sceneService.setShader(this.getFragmentShader(), 'frag');
    this.sceneService.createProgram(true);
  }
  setMetalicness(value: string) {
    this.metal = value;
    this.sceneService.setShader(this.getFragmentShader(), 'frag');
    this.sceneService.createProgram(true);
    console.log('metal', value);
  }

  setIOR(value: number) {
    this.ior = value;
    this.sceneService.setShader(this.getFragmentShader(), 'frag');
    this.sceneService.createProgram(true);

    console.log('ior', value);
  }

  setValue(value: string, material: string) {
    if (material == 'metallic') {
      this.setMetalicness(value);
      return;
    }
    if (material == 'roughness') {
      this.setRoughness(value);
      return;
    }
    if (material == 'color') {
      this.setColor(value);
      return;
    }
    if (material == 'normal') {
      this.setNormal(value);
      return;
    }
  }
  setTexture(texture: TextureModel, material: string) {
    let proceduralTexture;

    if (texture.name == TextureType.PERLIN) {
      proceduralTexture = ` perlinNoise(v_texCoord,float(${texture.scale}))`;
    } else if (texture.name == TextureType.VALUE) {
      proceduralTexture = ` layeredValueNoise(v_texCoord,int(${texture.itter}),float(${texture.scale}))`;
    } else if (texture.name == TextureType.BILLOW) {
      proceduralTexture = ` billowNoise(v_texCoord,float(${texture.scale}))`;
    } else if (texture.name == TextureType.RIDGED) {
      proceduralTexture = ` ridgedNoise(v_texCoord,float(${texture.scale}))`;
    } else {
      proceduralTexture = 'float(0.5)';
    }
    if(material == 'normal')
      {
        if (texture.name == TextureType.PERLIN) {
          proceduralTexture = ` calculateNormals(v_texCoord, 1,float(${texture.scale}),float(${texture.upper}),float(${texture.lower}))`;
        } else if (texture.name == TextureType.VALUE) {
          proceduralTexture = `calculateNormals(v_texCoord,float(${texture.scale}),int(${texture.itter}),float(${texture.upper}),float(${texture.lower}))`;
        } else if (texture.name == TextureType.BILLOW) {
          proceduralTexture = `calculateNormals(v_texCoord, 3,float(${texture.scale}),float(${texture.upper}),float(${texture.lower}))`;
        } else if (texture.name == TextureType.RIDGED) {
          proceduralTexture =`calculateNormals(v_texCoord, 2,float(${texture.scale}),float(${texture.upper}),float(${texture.lower}))`;
        }
        proceduralTexture = ` normalize(mix(v_normal.xyz, ${proceduralTexture}, 0.5))`;

      }
      if(material!="normal")

{
  if (texture.lower > texture.upper) {
    proceduralTexture = ` clamp(1.0-${proceduralTexture},float(${texture.upper}),float(${texture.lower}))`;
  } else {
    proceduralTexture = ` clamp(${proceduralTexture},float(${texture.lower}),float(${texture.upper}))`;
  }

  
}   
    if (material == 'color') {
      proceduralTexture = `vec3(${proceduralTexture})`;
      const color1 = this.hexToRgb2(texture.color1);
      const color2 = this.hexToRgb2(texture.color2);
      proceduralTexture = `mix(vec3(float(${color1[0] / 255}),float(${
        color1[1] / 255
      }),float(${color1[2] / 255})), vec3(float(${color2[0]/255}),float(${
        color2[1]/255
      }),float(${color2[2]/255})), ${proceduralTexture});`;
    }
    this.setValue(proceduralTexture, material);
  }
  hexToRgb2(hex: string) {
    hex = hex.replace(/^#/, '');

    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    return [r, g, b];
  }
}
