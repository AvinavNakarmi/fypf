import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { mat4 } from 'gl-matrix';
import { LightType } from 'src/app/enum/light-type';
import { ObjectType } from 'src/app/enum/object-type';
import { TextureType } from 'src/app/enum/texture-type';
import { Light } from 'src/app/model/light.model';
import { LightService } from 'src/app/services/light/light.service';
import { MaterialService } from 'src/app/services/material/material.service';
import { ObjectService } from 'src/app/services/object/object.service';
import { SceneService } from 'src/app/services/scene/scene.service';
import { TextureService } from 'src/app/services/texture/texture.service';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements AfterViewInit, OnInit {
  @ViewChild('canvas') canvasRef!: ElementRef;
  displayContextMenu: boolean = false;

  LightPreset: LightType[] = Object.values(LightType);
  ObjectPreset: ObjectType[] = Object.values(ObjectType);

  modelMatrix!: mat4;
  viewMatrix!: mat4;
  projectionMatrix!: mat4;
  lastMouseX: number = 0;
  lastMouseY: number = 0;
  mousePosition: number[] = [];

  objectData!: Float32Array;
  objectNormalData!: Float32Array;
  objectTextCoordData!: Float32Array;

  mousedown: boolean = false;
  fragShader!: string;
  vertexShader!: string;

  constructor(
    private sceneService: SceneService,
    private objectService: ObjectService,
    private lightService: LightService,
    private materialService: MaterialService,

    private textureService: TextureService
  ) {}

  ngOnInit() {
    this.objectData = this.objectService.getCubeVertexData();
    this.objectNormalData = this.objectService.getCubeVertexNormal();
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.modelMatrix = mat4.create();
    this.viewMatrix = mat4.create();
    this.projectionMatrix = mat4.create();

    mat4.perspective(
      this.projectionMatrix,
      (50 * Math.PI) / 180,
      canvas.offsetWidth / canvas.offsetHeight,
      0.1,
      100
    );

    mat4.lookAt(this.viewMatrix, [0, 0, 2], [0, 0, 0], [0, 1, 0]);
    mat4.translate(this.modelMatrix, this.modelMatrix, [0, 0, 0]);
    this.sceneService.createScene(this.canvasRef);
    this.sceneService.addObjectToScene(this.objectData);
    this.sceneService.addObjectNormalToScene(this.objectNormalData);
    this.sceneService.addObjectTextureCoordToScene(this.objectNormalData);

    this.sceneService.setShader(
      this.textureService.getFragmentShader(),
      'frag'
    );
    this.sceneService.setShader(
      this.textureService.getVertexShader(),
      'vertex'
    );

    this.sceneService.createFragmentShader();

    this.sceneService.createVertexShader();

    this.sceneService.createProgram();
    this.sceneService.setBuffer();
    this.sceneService.setRenderPreset();
    this.addLight(LightType.POINT_LIGHT);

    this.sceneService.render(
      this.modelMatrix,
      this.projectionMatrix,
      this.viewMatrix
    );
    this.Render();
  }
  Render = () => {
    this.sceneService.render(
      this.modelMatrix,
      this.projectionMatrix,
      this.viewMatrix
    );
    requestAnimationFrame(this.Render);
  };
  rotate(event: MouseEvent) {
    if (this.mousedown) {
      let newX = event.clientX;
      let newY = event.clientY;

      let deltaX = newX - this.lastMouseX;
      let deltaY = newY - this.lastMouseY;

      let newRotationMatrix = mat4.create();
      mat4.identity(newRotationMatrix);
      mat4.rotate(
        newRotationMatrix,
        newRotationMatrix,
        ((deltaX / 5) * Math.PI) / 180,
        [0, 1, 0]
      );
      mat4.rotate(
        newRotationMatrix,
        newRotationMatrix,
        ((deltaY / 5) * Math.PI) / 180,
        [1, 0, 0]
      );

      mat4.multiply(this.modelMatrix, newRotationMatrix, this.modelMatrix);

      this.lastMouseX = newX;
      this.lastMouseY = newY;
    }
  }
  up() {
    this.mousedown = false;
  }
  down(event: MouseEvent) {
    this.displayContextMenu = false;
    this.mousedown = true;
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
  }
  scale(event: WheelEvent) {
    const scaleStep = 0.9;
    const scaleStep2 = 1.1;

    if (event.deltaY > 0) {
      mat4.scale(this.modelMatrix, this.modelMatrix, [
        scaleStep,
        scaleStep,
        scaleStep,
      ]);
    } else {
      mat4.scale(this.modelMatrix, this.modelMatrix, [
        scaleStep2,
        scaleStep2,
        scaleStep2,
      ]);
    }
    event.preventDefault();
  }

  changeObject(object: ObjectType) {
    switch (object) {
      case ObjectType.CUBE:
        this.objectService.getPlane().subscribe((data) => {
          this.objectData = new Float32Array(data.vertices);
          this.objectNormalData = new Float32Array(data.normals);
          this.objectTextCoordData = new Float32Array(data.textCoord);

          this.sceneService.addObjectToScene(this.objectData);
          this.sceneService.addObjectNormalToScene(this.objectNormalData);
          this.sceneService.addObjectTextureCoordToScene(
            this.objectTextCoordData
          );
          this.sceneService.setBuffer();
        });

        break;
      case ObjectType.ICOSPHERE:
        this.objectService.getIcoSphere().subscribe((data) => {
          this.objectData = new Float32Array(data.vertices);
          this.objectTextCoordData = new Float32Array(data.textCoord);

          this.objectNormalData = new Float32Array(data.normals);

          this.sceneService.addObjectToScene(this.objectData);
          this.sceneService.addObjectTextureCoordToScene(
            this.objectTextCoordData
          );

          this.sceneService.addObjectNormalToScene(this.objectNormalData);

          this.sceneService.setBuffer();
        });

        break;
      case ObjectType.UV_SPHERE:
        this.objectService.getSphere().subscribe((data) => {
          this.objectData = new Float32Array(data.vertices);
          this.objectTextCoordData = new Float32Array(data.textCoord);

          this.objectNormalData = new Float32Array(data.normals);
          this.sceneService.addObjectToScene(this.objectData);
          this.sceneService.addObjectTextureCoordToScene(
            this.objectTextCoordData
          );

          this.sceneService.addObjectNormalToScene(this.objectNormalData);

          this.sceneService.setBuffer();
        });
        break;
      case ObjectType.CYLINDER:
        this.objectService.getCylinder().subscribe((data) => {
          this.objectData = new Float32Array(data.vertices);
          this.objectTextCoordData = new Float32Array(data.textCoord);

          this.objectNormalData = new Float32Array(data.normals);
          this.sceneService.addObjectToScene(this.objectData);
          this.sceneService.addObjectTextureCoordToScene(
            this.objectTextCoordData
          );

          this.sceneService.addObjectNormalToScene(this.objectNormalData);

          this.sceneService.setBuffer();
        });
        break;
      case ObjectType.IMPORT:
        const input = document.getElementById('import');
        input?.click();

        break;
      default:
        break;
    }

    this.sceneService.render(
      this.modelMatrix,
      this.projectionMatrix,
      this.viewMatrix
    );
  }
  rightClick(event: MouseEvent) {
    event.preventDefault();
    this.mousePosition[0] = event.clientX;
    this.mousePosition[1] = event.clientY;
    this.displayContextMenu = true;
  }

  addLight(lightType: LightType) {
    this.lightService.addlight(lightType);
  }

  uploadfile(event: Event) {
    const files = (event.target as HTMLInputElement).files;

    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          const content = event.target.result as string;

          const data = this.objectService.getImportedMesh(content);
          this.objectData = new Float32Array(data.vertices);
          this.objectNormalData = new Float32Array(data.normals);
          this.objectTextCoordData = new Float32Array(data.textCoord);

          this.sceneService.addObjectToScene(this.objectData);
          this.sceneService.addObjectTextureCoordToScene(
            this.objectTextCoordData
          );

          this.sceneService.addObjectNormalToScene(this.objectNormalData);
          this.sceneService.setBuffer();
        }
      };
      reader.readAsText(file);
    }
  }
  hexToRgb(hex: string) {
    hex = hex.replace(/^#/, '');

    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    return [r, g, b];
  }
  renderTexture(value: string, canvas: any, object: any) {
    const vertexShaderSource = ` 
precision mediump float;
attribute vec3 position;
attribute vec3 normal;
attribute vec2 a_texCoord;


varying vec4 v_position;
varying vec4 v_normal;
varying vec2 v_texCoord;

  
void main() {
  v_normal =vec4(normalize(normal), 1.0);
  v_position=vec4(position, 1.0);
  v_texCoord = a_texCoord;

    gl_Position =  vec4(position, 1.0);   
   }
`;
    const fragmentShaderSource = `
   precision mediump float;
varying vec4 v_position;
varying vec4 v_normal;
varying vec2 v_texCoord;



   
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

float RGBtoBW(vec3 color )
{
  return  (0.21*color.r)+(0.72*color.g)+(0.7* color.b);  
}

float RGBtoBW(vec4 color)
{
  return  (0.21*color.r)+(0.72*color.g)+(0.7* color.b);  
}
void main() {
  gl_FragColor = vec4(vec3(${value}),1.0);
 
   }`;

    try {
      const gl = canvas.getContext('webgl');
    } catch (err) {
      console.error(err);
    }
    const gl = canvas.getContext('webgl');

    if (gl) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.0, 0.0, 0.0, 1.0); // Black, fully opaque
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      const program = gl.createProgram();
      if (fragmentShader) {
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
          console.error(
            'Vertex shader compilation failed:',
            gl.getShaderInfoLog(vertexShader)
          );
          // Handle compilation failure here
        }
      }

      if (fragmentShader) {
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
          console.error(
            'Fragmernt shader compilation failed:',
            gl.getShaderInfoLog(fragmentShader)
          );
          // Handle compilation failure here
        }
      }
      if (gl && fragmentShader && vertexShader && program) {
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, object[0], gl.STATIC_DRAW);
        const positionLocation = gl.getAttribLocation(program, `position`);
        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        const nbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, nbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, object[1], gl.STATIC_DRAW);
        const normalLocation = gl.getAttribLocation(program, `normal`);
        gl.enableVertexAttribArray(normalLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, nbuffer);
        gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

        const tbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, tbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, object[2], gl.STATIC_DRAW);
        const textCoordLocation = gl.getAttribLocation(program, `a_texCoord`);
        gl.enableVertexAttribArray(textCoordLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, tbuffer);
        gl.vertexAttribPointer(textCoordLocation, 2, gl.FLOAT, false, 0, 0);

        gl.useProgram(program);
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0.2, 0.2, 0.2, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, object[0].length / 3);

        const error = gl.getError();
        if (error !== gl.NO_ERROR) {
          console.error('Error during buffer binding:', error);
        }
      }
    }
  }
  getTextures() {
    let canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;
    let canvas2 = document.getElementById('canvas2');
    if (canvas2) {
      canvas2.appendChild(canvas);
    }

    this.objectService.getPlane().subscribe((data) => {
      const objectVertexData = new Float32Array(data.vertices);
      const objectTextCoordData = new Float32Array(data.textCoord);

      const objectNormalData = new Float32Array(data.normals);

      const object = [objectVertexData, objectNormalData, objectTextCoordData];

      const materials = this.materialService.getAllMaterialProperties();

      materials.forEach((material) => {
        let rendervalue = '';
        let proceduralTextureList: any = [];

        if (material.name != 'IOR') {
          if (!material.isTexture) {
            if (material.name == 'color') {
              const color = this.hexToRgb(material.value);
              const r = color[0] / 255;
              const g = color[1] / 255;
              const b = color[2] / 255;
              rendervalue = `vec3(float(${r}),float(${g}),float(${b}))`;
            } else if (material.name == 'normal') {
              rendervalue = `normalize(v_normal.xyz)`;
            } else {
              rendervalue = `float(${material.value})`;
            }
          } else {
            let setup: any = [];
            material.TextureProperties.forEach((texture: any) => 
              {
              let tempval;

              if (material.name == 'normal') {
                if (texture.name == TextureType.PERLIN) {
                  tempval = `calculateNormals(v_texCoord, 1,float(${texture.scale}),float(${texture.upper}),float(${texture.lower}))`;
                } else if (texture.name == TextureType.VALUE) {
                  tempval = `calculateNormals(v_texCoord,float(${texture.scale}),int(${texture.itter}),float(${texture.upper}),float(${texture.lower}))`;
                } else if (texture.name == TextureType.BILLOW) {
                  tempval = `calculateNormals(v_texCoord, 3,float(${texture.scale}),float(${texture.upper}),float(${texture.lower}))`;
                } else if (texture.name == TextureType.RIDGED) {
                  tempval = `calculateNormals(v_texCoord, 2,float(${texture.scale}),float(${texture.upper}),float(${texture.lower}))`;
                }
                tempval = ` normalize(mix(v_normal.xyz, ${tempval}, 0.5))`;
              } else {
                if (texture.name == TextureType.PERLIN) {
                  tempval = ` perlinNoise(v_texCoord,float(${texture.scale}))`;
                } else if (texture.name == TextureType.VALUE) {
                  tempval = ` layeredValueNoise(v_texCoord,int(${texture.itter}),float(${texture.scale}))`;
                } else if (texture.name == TextureType.BILLOW) {
                  tempval = ` billowNoise(v_texCoord,float(${texture.scale}))`;
                } else if (texture.name == TextureType.RIDGED) {
                  tempval = ` ridgedNoise(v_texCoord,float(${texture.scale}))`;
                } else {
                  tempval = 'float(0.5)';
                }
                if (texture.lower > texture.upper) {
                  tempval = ` clamp(1.0-${tempval},float(${texture.upper}),float(${texture.lower}))`;
                } else {
                  tempval = ` clamp(${tempval},float(${texture.lower}),float(${texture.upper}))`;
                }
                if (material.name == 'color') {
                  tempval = `vec3(${tempval})`;
                  const color1 = this.hexToRgb(texture.color1);
                  const color2 = this.hexToRgb(texture.color2);
                  tempval = `mix(vec3(float(${color1[0] / 255}),float(${
                    color1[1] / 255
                  }),float(${color1[2] / 255})), vec3(float(${
                    color2[0] / 255
                  }),float(${color2[1] / 255}),float(${
                    color2[2] / 255
                  })), ${tempval})`;
                }
              }
              setup.push(tempval);
            });
            
if(setup.length==1)
  {
    rendervalue =  setup[0];
  }
  else
  {
    setup.forEach( (pt:any)=>
      {
        if(!rendervalue)
          {
            rendervalue =pt;  
          }
          else
          {
            rendervalue = `mix(${rendervalue},${pt},0.5)`;
          }

      }
      
    )
  }

          }
          this.renderTexture(rendervalue, canvas, object);
          this.downloadImage(canvas, material.name);
        }

        // if(material.name!="IOR")
        //   {
        //     if(material.isTexture)
        //       {
        //         if(material.isImageTexture)
        //           {

        //           }
        //           else
        //           {
        //             if(material.name=="normal")
        //               {

        //                 if ( material.TextureProperties[0].name == TextureType.PERLIN) {
        //                   rendervalue = ` calculateNormals(v_texCoord, 1,float(${material.TextureProperties[0].scale}),float(${material.TextureProperties[0].upper}),float(${material.TextureProperties[0].lower}))`;
        //                 } else if (material.TextureProperties[0].name == TextureType.VALUE) {
        //                   rendervalue = `calculateNormals(v_texCoord,float(${material.TextureProperties[0].scale}),int(${material.TextureProperties[0].itter}),float(${material.TextureProperties[0].upper}),float(${material.TextureProperties[0].lower}))`;
        //                 } else if (material.TextureProperties[0].name == TextureType.BILLOW) {
        //                   rendervalue = `calculateNormals(v_texCoord, 3,float(${material.TextureProperties[0].scale}),float(${material.TextureProperties[0].upper}),float(${material.TextureProperties[0].lower}))`;
        //                 } else if (material.TextureProperties[0].name == TextureType.RIDGED) {
        //                   rendervalue =`calculateNormals(v_texCoord, 2,float(${material.TextureProperties[0].scale}),float(${material.TextureProperties[0].upper}),float(${material.TextureProperties[0].lower}))`;
        //                 }
        //                 rendervalue = ` normalize(mix(v_normal.xyz, ${rendervalue}, 0.5))`;
        //               }
        //               else
        //               {
        //                 if (material.TextureProperties[0].name == TextureType.PERLIN) {
        //                   rendervalue = ` perlinNoise(v_texCoord,float(${material.TextureProperties[0].scale}))`;
        //                 } else if (material.TextureProperties[0].name == TextureType.VALUE) {
        //                   rendervalue = ` layeredValueNoise(v_texCoord,int(${material.TextureProperties[0].itter}),float(${material.TextureProperties[0].scale}))`;
        //                 } else if (material.TextureProperties[0].name == TextureType.BILLOW) {
        //                   rendervalue = ` billowNoise(v_texCoord,float(${material.TextureProperties[0].scale}))`;
        //                 } else if (material.TextureProperties[0].name == TextureType.RIDGED) {
        //                   rendervalue = ` ridgedNoise(v_texCoord,float(${material.TextureProperties[0].scale}))`;
        //                 } else {
        //                   rendervalue = 'float(0.5)';
        //                 }
        //                 if (material.TextureProperties[0].lower > material.TextureProperties[0].upper) {
        //                   rendervalue = ` clamp(1.0-${rendervalue},float(${material.TextureProperties[0].upper}),float(${material.TextureProperties[0].lower}))`;
        //                 } else {
        //                   rendervalue = ` clamp(${rendervalue},float(${material.TextureProperties[0].lower}),float(${material.TextureProperties[0].upper}))`;
        //                 }
        //                 if (material == 'color') {
        //                   rendervalue = `vec3(${rendervalue})`;
        //                   const color1 = this.hexToRgb(material.TextureProperties[0].color1);
        //                   const color2 = this.hexToRgb(material.TextureProperties[0].color2);
        //                   rendervalue = `mix(vec3(float(${color1[0] / 255}),float(${
        //                     color1[1] / 255
        //                   }),float(${color1[2] / 255})), vec3(float(${color2[0]/255}),float(${
        //                     color2[1]/255
        //                   }),float(${color2[2]/255})), ${rendervalue});`;
        //                 }
        //               }
        //           }
        //       }
        //       else
        //       {
        //         if(material.name =="color")
        //           {
        //             const color  =this .hexToRgb(material.value);
        //             rendervalue = `vec3(float(${color[0]/255}),float(${color[1]/255}),float(${color[2]/255}))`;
        //           }
        //           else if(material.name =="normal")
        //             {
        //               rendervalue = `normalize(v_normal.xyz)`;
        //             }
        //           else
        //             {
        //               rendervalue =`vec3(float(${material.value}))`;
        //             }

        //       }

        // if (material.isTexture)
        //   {

        //   }
        //   const value = material.value
        //   this.renderTexture(rendervalue,canvas,object);
        //   this.downloadImage(canvas,material.name);
        // }
      });
    });
  }
  downloadImage(canvas: any, filename: string) {
    var image = canvas.toDataURL('image/png');
    // Create a link element to download the image
    var link = document.createElement('a');
    link.href = image;
    link.download = `${filename}.png`;
    link.click();
  }
}
