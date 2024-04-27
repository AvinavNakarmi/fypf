precision highp float;
uniform vec2  u_resolution;
float voronoiNoise(vec2 uv,float scale)
{
    uv =uv*scale;
    vec2 gridID = floor(uv);
    vec2 gridUV = fract (uv);
    gridUV= gridUV-0.5;

    return 1.0;
}
void  main()
{
    vec2 uv = gl_FragCoord.xy/u_resolution;
    gl_FragColor= vec4(vec3(voronoiNoise(uv,4.0)), 1.0);
}