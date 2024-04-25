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
import { ObjectService } from 'src/app/services/object.service';
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

  mousedown: boolean = false;

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

    this.sceneService.createFragmentShader(`
    #define PI 3.14
    #define POINT_LIGHT 0
    #define DIRECT_LIGHT 1

    precision mediump float;

    uniform vec3 lightColor [10];
    uniform int lightType [10];
    uniform vec3 lightPosition[10];
    uniform float lightIntencity[10];
    uniform int u_numLights;
     
    varying vec4 v_normal;
    varying vec4 v_position;

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
  vec3 meshColor = vec3(1.0);
  float metalicness = 0.9;
  float roughness = 0.5;
  float ior = 1.319;
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
    vec3 diffusedLight = lights[i].color * diffusedBRDF(meshColor, lights[i].position) * (1. - metalicness);
    vec3 specularLight = lights[i].color * specularBRDF(nDotL, nDotV, roughness, F0);
    float lightIntencity = lights[i].intencity / lightAttenuation(lights[i]);
    vec4 color = vec4(((diffusedLight + specularLight) * lightIntencity * nDotL), 1.);
    finalColor = min(finalColor + color, vec4(1.0));
    finalColor = max(finalColor, vec4(0.0));
  }

  gl_FragColor = vec4(finalColor);
}

    `);

    this.sceneService.createVertexShader(
      `

      attribute vec3 normal;
      
    precision mediump float;
    uniform mat4 modelMatrix; 
    uniform mat4 projectionMatrix;
    uniform mat4 viewMatrix;
    uniform mat4 Matrix;
    varying vec4 v_normal;
    varying vec4 v_position;




    attribute vec3 position;
    void main() {
      v_normal =projectionMatrix*viewMatrix*modelMatrix*vec4(normal, 1.0);
      v_position=projectionMatrix*viewMatrix*modelMatrix*vec4(position, 1.0);

        gl_Position = projectionMatrix*viewMatrix*modelMatrix* vec4(position, 1);    }
    `
    );

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
        });

        break;
      case ObjectType.ICOSPHERE:
        this.objectService
          .getIcoSphere()
          .subscribe((data) => {this.objectData = new Float32Array(data.vertices);
            this.objectNormalData = new Float32Array(data.normals);


          });

        break;
      case ObjectType.UV_SPHERE:
        this.objectService
          .getSphere()
          .subscribe((data) => {this.objectData = new Float32Array(data.vertices);
          this.objectNormalData = new Float32Array(data.normals);


            
          });
        break;
      case ObjectType.CYLINDER:
        this.objectService.getCylinder().subscribe((data) => {
          this.objectData = new Float32Array(data.vertices);
          this.objectNormalData = new Float32Array(data.normals);
        });
        break;
        case ObjectType.IMPORT:
          const input = document.getElementById('import');
          input?.click();
       
        break;
      default:
        break;
    }

    this.sceneService.addObjectToScene(this.objectData);
    this.sceneService.addObjectNormalToScene(this.objectNormalData);

    this.sceneService.setBuffer();
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

  
  uploadfile(event:Event)
  {
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
         
      };
     

    }
    reader.readAsText(file);

  }

}
}