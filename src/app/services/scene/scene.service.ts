import { ElementRef, Injectable } from '@angular/core';
import { mat4 } from 'gl-matrix';
import { Light } from 'src/app/model/light.model';
import { LightService } from '../light/light.service';
import { LightType } from 'src/app/enum/light-type';
import { ObjectService } from '../object.service';

@Injectable({
  providedIn: 'root',
})
export class SceneService {
  gl: WebGLRenderingContext | null = null;
  program: WebGLProgram | null = null;
  vertexShader: WebGLShader | null = null;
  fragmentShader: WebGLShader | null = null;
  object!: Float32Array;
  objectNormal!: Float32Array;
  lights$:Light[]=[]; 

  constructor(private lightService:LightService,private objectService:ObjectService) {
    this.lightService.getLights().subscribe(lights=>this.lights$=lights);
  }
  createScene(canvasRef: ElementRef) {
    try {
      this.gl = canvasRef.nativeElement.getContext('webgl');
    } catch (err) {
      console.error(err);
    }
    if(this.gl)
    {
      this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
      this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
      this.program = this.gl.createProgram();

    }

  }
  addObjectToScene(objectVertexData: Float32Array) {
    this.object = objectVertexData;
  }
  addObjectNormalToScene(objectNormalData:Float32Array)
  {
    this.objectNormal = objectNormalData;

  }

  createVertexShader(shader: string) {
    if (this.gl) {
      if (this.vertexShader) {
        this.gl.shaderSource(this.vertexShader, shader);
        this.gl.compileShader(this.vertexShader);
        if (!this.gl.getShaderParameter(this.vertexShader, this.gl.COMPILE_STATUS)) {
          console.error('Vertex shader compilation failed:', this.gl.getShaderInfoLog(this.vertexShader));
          // Handle compilation failure here
        }
      }
      
    }
    
  }

  createFragmentShader(shader: string) {
    if (this.gl) {
      if (this.fragmentShader) {
        this.gl.shaderSource(this.fragmentShader, shader);
        this.gl.compileShader(this.fragmentShader);
        if (!this.gl.getShaderParameter(this.fragmentShader, this.gl.COMPILE_STATUS)) {
          console.error('Vertex shader compilation failed:', this.gl.getShaderInfoLog(this.fragmentShader));
          // Handle compilation failure here
        }
      }
    }
  }
  createProgram() {

    if (this.gl && this.fragmentShader && this.vertexShader && this.program){
      this.gl.attachShader(this.program, this.vertexShader);
      this.gl.attachShader(this.program, this.fragmentShader);
      this.gl.linkProgram(this.program);
    }
    
  }
  setBuffer() {
    if (this.gl && this.program) {
      
const buffer = this.gl.createBuffer();
this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
this.gl.bufferData(this.gl.ARRAY_BUFFER, this.object, this.gl.STATIC_DRAW);


const positionLocation = this.gl.getAttribLocation(this.program, `position`);
this.gl.enableVertexAttribArray(positionLocation);
this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 0, 0);
      
const nbuffer = this.gl.createBuffer();
this.gl.bindBuffer(this.gl.ARRAY_BUFFER, nbuffer);
this.gl.bufferData(this.gl.ARRAY_BUFFER, this.objectNormal, this.gl.STATIC_DRAW);


const npositionLocation = this.gl.getAttribLocation(this.program, `normal`);
this.gl.enableVertexAttribArray(npositionLocation);
this.gl.bindBuffer(this.gl.ARRAY_BUFFER, nbuffer);
this.gl.vertexAttribPointer(npositionLocation, 3, this.gl.FLOAT, false, 0, 0);



    }
  }
  setRenderPreset() {
    if (this.gl) {
      this.gl.useProgram(this.program);
      this.gl.enable(this.gl.DEPTH_TEST);
      this.gl.enable(this.gl.BLEND);
      this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    }
  }
  render(modelMatrix:mat4,projectionMatrix:mat4,viewMatrix:mat4) {
    if (this.gl&&this.program) {
      const mMatrix= this.gl.getUniformLocation(this.program, `modelMatrix`);
      const pMatrix= this.gl.getUniformLocation(this.program, `projectionMatrix`);
      const vMatrix= this.gl.getUniformLocation(this.program, `viewMatrix`);
  
let numLights = this.lights$.length;

let lightColors:any = [];
let lightPositions:any = [];
let lightIntencity:any = [];
let lightType:any =[];

for (var i = 0; i < numLights; i++) {
    lightColors = lightColors.concat(this.lights$[i].color);
    lightPositions = lightPositions.concat(this.lights$[i].position);
    lightIntencity = lightIntencity.concat(this.lights$[i].intencity);
    if(this.lights$[i].lightType== LightType.DIRECT_LIGHT)
      {
        lightType = lightType.concat(1);
      }
      else
      {
        lightType = lightType.concat(0);
      }

  }
var flattenedColorArray = [].concat.apply([], lightColors);
var flattenedPositionArray = [].concat.apply([], lightPositions);


      this.gl.uniformMatrix4fv(mMatrix, false,modelMatrix);
      this.gl.uniformMatrix4fv(pMatrix, false,projectionMatrix);
      this.gl.uniformMatrix4fv(vMatrix, false,viewMatrix);
      let lightColorUniformLocation = this.gl.getUniformLocation(this.program, 'lightColor');
      
      let uniformLocation = this.gl.getUniformLocation(this.program, "u_numLights");

      let lightPositionUniformLocation = this.gl.getUniformLocation(this.program, 'lightPosition');
      
      let lightIntensityUniformLocation = this.gl.getUniformLocation(this.program, 'lightIntencity');
      let lightTypeUniformLocation = this.gl.getUniformLocation(this.program, 'lightType');

      this.gl.uniform3fv(lightColorUniformLocation , flattenedColorArray);


      this.gl.uniform1i(uniformLocation, numLights);

      this.gl.uniform3fv(lightPositionUniformLocation , flattenedPositionArray);

      this.gl.uniform1fv(lightIntensityUniformLocation,lightIntencity);
      this.gl.uniform1iv(lightTypeUniformLocation,lightType);

      // this.gl.uniform3fv(lightUniformLocation + '.position', this.lights$.position);
      // this.gl.uniform3fv(lightUniformLocation + '.intencity', this.lights$.position);
      // this.gl.uniform3fv(lightUniformLocation +5 '.intencity', this.lights$.position);



      this.gl.clearColor(0.2, 0.2, 0.2, 1.0);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      this.gl.drawArrays(this.gl.TRIANGLES, 0,  this.object.length / 3);
      
      // this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0,  this.object.length / 3);
      // this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, this.object.length / 3);

            // this.gl.drawArrays(this.gl.TRIANGLES, 0, (30 + 1) * 2 * (30 + 1));
      // this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, (30 + 1) * 2 * (30 + 1));
      // this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, (30 + 1) * 2 * (30 + 1));
      

    }
  }
}
