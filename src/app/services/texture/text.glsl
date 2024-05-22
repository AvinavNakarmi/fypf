
  #define PI 3.14
  #define POINT_LIGHT 0
  #define DIRECT_LIGHT 1

  precision highp float;
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
  
  float RGBtoBW(vec4 color)
  {
    return  (0.21*color.r)+(0.72*color.g)+(0.7* color.b);  
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

vec2 noise2x2(vec2 p) {
  float x = dot(p, vec2(123.4, 234.5));
  float y = dot(p, vec2(345.6, 456.7));
  vec2 noise = vec2(x, y);
  noise = sin(noise);
  noise = noise * 43758.5453;
  noise = fract(noise);
  return  noise;
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
float voronoiNoise(vec2 uv,float scale,float seed)
{
  
  vec3 color = vec3(0.0);
  uv = uv* scale;
  vec2  currentGridCoord = fract(uv);
  vec2  currentGridID = floor(uv);

   color = vec3(currentGridCoord, 0.0);
  float minDistFromPixel = 1.0;
  
  for (float i = -1.0; i <= 1.0; i++) {
    for (float j = -1.0; j <= 1.0; j++) {
      vec2 adjGridCoords = vec2(i, j);
      vec2 pointOnAdjGrid = adjGridCoords;
vec2 noise = noise2x2(currentGridID + adjGridCoords);
 pointOnAdjGrid = adjGridCoords + sin(seed* noise) * 0.5;

      float dist = length(currentGridCoord - pointOnAdjGrid);
      minDistFromPixel = min(dist, minDistFromPixel);

    }

  }


  // part 3.2 - display voronoi noise
  color = vec3(minDistFromPixel);

  // part 3.3 - display clouds

  // part 3.4 - display clouds with dots


  return RGBtoBW(vec4(vec3(color),1.0));
  
}

vec3 calculateNormals(vec2 uv,float scale,float upper ,float lower,int  random)
{
  float diff= 0.0001;
  float height = .0001;
   float p1 =  voronoiNoise((uv +vec2(diff,0.0)),scale,random);
   float p2 =  voronoiNoise((uv -vec2(diff,0.0)),scale,random);
   float p3 =  voronoiNoise((uv +vec2(0.0,diff)),scale,random);
   float p4 =  voronoiNoise((uv -vec2(0.0,diff)),scale,random);
    
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
  

void main() {
vec3 meshColor = vec3(1.0);
float metalicness = 1.0;
float roughness = 1.0;
float ior = 1.;

vec3 camera = vec3(0.0,0.0,5.0);
vec3 F0 = fresnelFactor(ior);
vec3 N = vec3(1.);
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
   gl_FragColor = vec4(finalColor);

}
}
