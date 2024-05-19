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
import { Light } from 'src/app/model/light.model';
import { LightService } from 'src/app/services/light/light.service';
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

    this.sceneService.setShader(this.textureService.getFragmentShader(),"frag");
    this.sceneService.setShader(this.textureService.getVertexShader(),"vertex");

    this.sceneService.createFragmentShader( );

    this.sceneService.createVertexShader( );

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
        this.objectService.getCube().subscribe((data) => {
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
  getTextures()
  {
    let canvas = document.createElement('canvas');
    let object = this .objectService.getPlane();
let vertexShaderSource = `



precision mediump float;

attribute vec3 position;
void main() {

  gl_Position = vec4(position, 1);   
 }

`;
let fragmentShaderSource =`precision mediump float;
uniform vec2 u_resolution;
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
vec2  uv = gl_FragCoord.xy/u_resolution;
 
  gl_FragColor =  vec4(vec3(perlinNoise(uv,5.0)),1.0);
}`;
canvas.id = "CursorLayer";
canvas.width = 500;
canvas.height = 500;
const gl= canvas.getContext("webgl");
if (gl)
  {
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const program = gl.createProgram();   
    if(vertexShader)
      {
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);
    
      }
      if(fragmentShader)
        {
          gl.shaderSource(fragmentShader, fragmentShaderSource);
          gl.compileShader(fragmentShader);
        }
        if (fragmentShader && vertexShader && program){
          gl.attachShader(program, vertexShader);
          gl.attachShader(program, fragmentShader);
          gl.linkProgram(program);
        }
        if (program) {
      
          const buffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
          gl.bufferData(gl.ARRAY_BUFFER, object, gl.STATIC_DRAW);
          
          
          const positionLocation = gl.getAttribLocation(program, `position`);
          gl.enableVertexAttribArray(positionLocation);
          gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
          gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
              
          gl.useProgram(program);     
          let resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

          gl.uniform2fv(resolutionLocation , new Float32Array([500,500]));
          gl.drawArrays(gl.TRIANGLES, 0,  object.length / 3);
   
          }
   
        }

        var image = canvas.toDataURL("image/png");

        // Create a link element to download the image
        var link = document.createElement('a');
        link.href = image;
        link.download = 'texture.png';
        link.click();

canvas.remove();

  }

  uploadImage(event: Event) {
    
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.[0]; // Get the selected file
    if (!file) return; // If no file is selected, return
  
    const reader = new FileReader(); // Create a FileReader object
  
    // Set up the FileReader onload event
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string; // Get the data URL of the uploaded image
      const image = new Image(); // Create a new Image object
      image.src = imageUrl; // Set the src attribute of the Image object to the data URL
  
      // Optionally, you can add an onload event handler to execute code when the image is loaded
      image.onload = () => {

      }
    }
    reader.readAsDataURL(file);
  }
}
