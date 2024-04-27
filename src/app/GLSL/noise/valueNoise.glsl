precision highp float;
uniform vec2 u_resolution;

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
float layeredValueNoise(vec2 uv, int itter)
{
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


void main()
{
     vec2 uv =(gl_FragCoord.xy/u_resolution);
    gl_FragColor =vec4(vec3(layeredValueNoise(uv,3)),1.0);
}