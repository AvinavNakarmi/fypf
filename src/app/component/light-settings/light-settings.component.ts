import { Component, OnInit } from '@angular/core';
import { isEmpty } from 'rxjs';
import { TextureType } from 'src/app/enum/texture-type';
import { Light } from 'src/app/model/light.model';
import { LightService } from 'src/app/services/light/light.service';
import { MaterialService } from 'src/app/services/material/material.service';
import { SceneService } from 'src/app/services/scene/scene.service';
import { TextureService } from 'src/app/services/texture/texture.service';

@Component({
  selector: 'app-light-settings',
  templateUrl: './light-settings.component.html',
  styleUrls: ['./light-settings.component.scss'],
})
export class LightSettingsComponent implements OnInit {
  lights: Light[] = [];

  fieldToggle: number = 1;
  TexturePreset: TextureType[] = Object.values(TextureType);
  materialProperties: any[] = [
    {
      name: 'metallic',
      value: 0.5,
      isTexture: false,
      isImageTexture: false,
      ImageTexture: null,
      ImgSrc: "",

      isSetImageTexture: false,
      TextureProperties: [
        {
          name: TextureType.PERLIN,
          scale: 10.0,
          upper:.9,
          lower:0.1,
          itter: null,
        },
      ],
    },
    {
      name: 'roughness',
      value: 0.5,
      isTexture: false,
      isImageTexture: false,
      ImageTexture: null,
      ImgSrc: "",

      isSetImageTexture: false,
      TextureProperties: [
        {
          name: TextureType.PERLIN,
          scale: 10.0,
          upper:.9,
          lower:0.1,
          itter: null,
        },
      ],
    },
    {
      name: 'IOR',
      value: 0.5,
    },
    {
      name: 'color',
      value: "#ffffff",
      isTexture: false,
      isImageTexture: false,
      ImageTexture: null,
      ImgSrc: "",


      isSetImageTexture: false,
      TextureProperties: [
        {
          name: TextureType.PERLIN,
          scale: 1,
          upper:.9,
          lower:0.1,
          color1:"#ffffff",
          color2:"#000000",
          itter: null,
        },
      ],
    },
    {
      name: 'normal',
      value: "v_normal.xyz",
      isTexture: false,
      isImageTexture: false,
      ImageTexture: null,

      isSetImageTexture: false,
      TextureProperties: [
        {
          name: TextureType.PERLIN,
          scale: 1,
          upper:.9,
          lower:0.1,
          itter: null,
          random:null,
        },
      ],
    },
  ];
  currentMaterialProperties: any;

  setTextureUpper(event:Event ,id :number)
  {
    this.currentMaterialProperties.TextureProperties[id].upper =parseFloat((event.target as HTMLInputElement).value);
    this.textureService.setTexture(this.currentMaterialProperties.TextureProperties,this.currentMaterialProperties.name);
    this.setGlobalMaterial();

  }
  setTextureLower(event:Event,id :number)
  {
    this.currentMaterialProperties.TextureProperties[id].lower =parseFloat((event.target as HTMLInputElement).value);
    this.textureService.setTexture(this.currentMaterialProperties.TextureProperties,this.currentMaterialProperties.name)
    this.setGlobalMaterial();

  }
  setRandom(event:Event ,id :number)
  {
    this.currentMaterialProperties.TextureProperties[id].random =parseFloat((event.target as HTMLInputElement).value);
    this.textureService.setTexture(this.currentMaterialProperties.TextureProperties,this.currentMaterialProperties.name)
    this.setGlobalMaterial();

  }
  
  setItteration(event:Event ,id :number)
  {
    this.currentMaterialProperties.TextureProperties[id].itter =parseFloat((event.target as HTMLInputElement).value);
    this.textureService.setTexture(this.currentMaterialProperties.TextureProperties,this.currentMaterialProperties.name)
    this.setGlobalMaterial();

  }
  setTextureScale(event:Event ,id :number)
  {
    this.currentMaterialProperties.TextureProperties[id].scale =parseFloat((event.target as HTMLInputElement).value);
    this.textureService.setTexture(this.currentMaterialProperties.TextureProperties,this.currentMaterialProperties.name)
    this.setGlobalMaterial();

  }
  setGlobalMaterial()
  {
    console.log(this .currentMaterialProperties);
    this.materialService.setMaterialProperties(this.currentMaterialProperties.name,this.currentMaterialProperties);

  }
  changeProceduralTextureType(event: Event,id :number) {
    this.currentMaterialProperties.TextureProperties.name = (
      event.target as HTMLInputElement
    ).value as TextureType;
    if (
      this.currentMaterialProperties.TextureProperties[id].name ==
      TextureType.VALUE
    ) {
      this.currentMaterialProperties.TextureProperties[id].itter = 1.0;
    } else {
      this.currentMaterialProperties.TextureProperties[id].itter = null;
    }
    if (
      this.currentMaterialProperties.TextureProperties[id].name ==
      TextureType.VORONOI
    ) {
      this.currentMaterialProperties.TextureProperties[id].random = 1.0;
    } else {
      this.currentMaterialProperties.TextureProperties[id].random = null;
    }
   
    this.textureService.setTexture(this.currentMaterialProperties.TextureProperties,this.currentMaterialProperties.name);
    this.setGlobalMaterial();
        
  }
  changeTextureColor(event:Event, index:number,id:number)
  {
    if(index==1)
      {
        this.currentMaterialProperties.TextureProperties[id].color1 =(event.target as HTMLInputElement).value;
        const color = this.hexToRgb2(this .currentMaterialProperties.value);
        this.textureService.setTexture( this.currentMaterialProperties.TextureProperties,
          this.currentMaterialProperties.name
        );
      
      }
  else
  {
    this.currentMaterialProperties.TextureProperties[id].color2 =(event.target as HTMLInputElement).value;
    const color = this.hexToRgb2(this .currentMaterialProperties.value);
    this.textureService.setTexture( this.currentMaterialProperties.TextureProperties,
      this.currentMaterialProperties.name
    );
  
  }
  this.setGlobalMaterial();

    }
  changeValue(event: Event) {

  
    if(this.currentMaterialProperties.name=="color")
      {
        this.currentMaterialProperties.value =(event.target as HTMLInputElement).value;
        const color = this.hexToRgb2(this .currentMaterialProperties.value);
        this.textureService.setValue(
          `vec3(float(${color[0]/255}),float(${color[1]/255}),float(${color[2]/255}))`,
          this.currentMaterialProperties.name
        );
    this.setGlobalMaterial();

        return;
    } 
    this.currentMaterialProperties.value =(event.target as HTMLInputElement).value;
    this.textureService.setValue(
      `float(${this.currentMaterialProperties.value})`,
      this.currentMaterialProperties.name
    );
    this.setGlobalMaterial();

  }
  selectedLight: Light | undefined;
  constructor(
    private lightService: LightService,
    private textureService: TextureService,
    private materialService:MaterialService,
    private sceneService: SceneService
  ) {
    this.lightService.getLights().subscribe((data) => (this.lights = data));
  }

  ngOnInit(): void {}

  deleteLight(lightId: number) {
    if (this.selectedLight && this.selectedLight.LightID == lightId) {
      this.selectedLight = undefined;
    }
    this.lightService.removelight(lightId);
  }
  displayLightData(light: Light) {
    this.selectedLight = light;
  }
  changeLight() {
    if (this.selectedLight) {
      this.lightService.editLight(
        this.selectedLight.LightID,
        this.selectedLight
      );
    }
  }
  get modifiedData(): string {
    if (this.selectedLight) {
      return this.RGBTohex(this.selectedLight.color);
    }

    return '#ffffff';
  }

  set modifiedData(value: string) {
    if (this.selectedLight) {
      this.hexToRgb(value);
    }
  }
  addProceduralTexture() {
    this.currentMaterialProperties.isTexture = true;
    if(this.currentMaterialProperties.TextureProperties.length==0)
      {
        this.addTexture();
      }
   
        this.textureService.setTexture(this.currentMaterialProperties.TextureProperties,this.currentMaterialProperties.name);
        this.setGlobalMaterial();
   
  }

  closeImageComponent() {
    this.currentMaterialProperties.isTexture = false;
    this.currentMaterialProperties.isImageTexture = false;
    this.setGlobalMaterial();

  }

  addImageTexture() {
    this.currentMaterialProperties.isTexture = true;
    this.currentMaterialProperties.isImageTexture = true;
    this.setGlobalMaterial();

  }

  RGBTohex(rgb: number[]) {
    let rHex = rgb[0].toString(16);
    let r = rHex.length == 1 ? '0' + rHex : rHex;

    let gHex = rgb[1].toString(16);
    let g = gHex.length == 1 ? '0' + gHex : gHex;

    let bHex = rgb[2].toString(16);
    let b = bHex.length == 1 ? '0' + bHex : bHex;

    return '#' + r + g + b;
  }
  hexToRgb(hex: string) {
    hex = hex.replace(/^#/, '');

    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    if (this.selectedLight) {
      this.selectedLight.color = [r, g, b];
    }
  }
  hexToRgb2(hex: string) {
    hex = hex.replace(/^#/, '');

    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    return [r,g,b];
  }
  lightStyle(index: number) {
    if (!this.selectedLight) {
      return 'light-inactive';
    }

    if (this.selectedLight.LightID == index) {
      return 'light-active';
    }
    return 'light-inactive';
  }
  toggle(index: number) {
    this.fieldToggle = index;
    this.currentMaterialProperties = this.materialProperties[index - 2];
  }

  setImageTexture(event: Event) {
    try {
      this.uploadImageTexture(event, this.currentMaterialProperties.name);
      this.currentMaterialProperties.isSetImageTexture = true;
      if (this.currentMaterialProperties.isSetImageTexture) {
        if (this.currentMaterialProperties.name == 'metallic') {
          this.textureService.setValue(
            ` clamp(RGBtoBW(texture2D(u_metalImageTexture, v_texCoord)),0.01,0.90)`,
            this.currentMaterialProperties.name
          );
    this.setGlobalMaterial();

          return;
        }
        if (this.currentMaterialProperties.name == 'roughness') {
          this.textureService.setValue(
            ` clamp(RGBtoBW(texture2D(u_roughnessImageTexture, v_texCoord)),0.01,0.90)`,
            this.currentMaterialProperties.name
          );
          this.setGlobalMaterial();

          return;
        }

       
        if (this.currentMaterialProperties.name == 'color') {
          this.textureService.setValue(
            ` texture2D(u_colorImageTexture, v_texCoord).xyz`,
            this.currentMaterialProperties.name
          );
    this.setGlobalMaterial();

          return;
        }
        if (this.currentMaterialProperties.name == 'normal') {
          this.textureService.setValue(
            ` clamp(RGBtoBW(texture2D(u_normalImageTexture, v_texCoord)),0.01,0.90)`,
            this.currentMaterialProperties.name
          );
    this.setGlobalMaterial();

          return;
        }
      }
    } catch (e) {
      this.currentMaterialProperties.isImageTexture = false;

      console.log(e);
    }
  }

  uploadImageTexture(event: Event, type: string) {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.[0]; // Get the selected file
    if (!file) return; // If no file is selected, return

    const reader = new FileReader(); // Create a FileReader object

    // Set up the FileReader onload event
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string; // Get the data URL of the uploaded image
      this.currentMaterialProperties.ImageTexture=new Image();
      this.currentMaterialProperties.ImageTexture.src = imageUrl;
      this.currentMaterialProperties.ImgSrc = imageUrl; // Set the src attribute of the Image object to the data URL
       // Set the src attribute of the Image object to the data URL
      
       // Optionally, you can add an onload event handler to execute code when the image is loaded
      this.currentMaterialProperties.ImageTexture.onload = () => {
        this.setGlobalMaterial();
        
        this.sceneService.renderImageTexture(this.currentMaterialProperties.ImageTexture
          , type);
      };
    };
    reader.readAsDataURL(file);
  }
  addTexture()
  {
    let textureProperty:any = { 
      name: TextureType.PERLIN,
      scale: 10.0,
      upper:.9,
      lower:0.1,
      itter: null,
    };
   if( this.currentMaterialProperties.name=="color")
    {
textureProperty =  {
  name: TextureType.PERLIN,
  scale: 1,
  upper:.9,
  lower:0.1,
  color1:"#ffffff",
  color2:"#000000",
  itter: null,
}
    }

    this.currentMaterialProperties.TextureProperties.push(textureProperty);
    this.textureService.setTexture(this.currentMaterialProperties.TextureProperties,this.currentMaterialProperties.name);
    this.setGlobalMaterial();
  }
  removeTexture(id:number)
  {
    this.currentMaterialProperties.TextureProperties.splice(id,1);
    if(this.currentMaterialProperties.TextureProperties.length==0)
      {
        this.currentMaterialProperties.isTexture =false;
        if(this.currentMaterialProperties.name=="color")
          {
            const color = this.hexToRgb2(this.currentMaterialProperties.value);
            this.textureService.setValue(`vec3(float(${color[0]/255}),float(${color[1]/255}),float(${color[2]/255}))`,this.currentMaterialProperties.name);
          }
          else
          {
            this.textureService.setValue(this.currentMaterialProperties.value,this.currentMaterialProperties.name);

          }
      }
      else
      {
        this.textureService.setTexture(this.currentMaterialProperties.TextureProperties,this.currentMaterialProperties.name);
      }
    this .setGlobalMaterial();



  }
}
