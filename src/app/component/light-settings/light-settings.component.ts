import { Component, OnInit } from '@angular/core';
import { isEmpty } from 'rxjs';
import { TextureType } from 'src/app/enum/texture-type';
import { Light } from 'src/app/model/light.model';
import { LightService } from 'src/app/services/light/light.service';
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
      value: 0.5,
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
        },
      ],
    },
  ];
  currentMaterialProperties: any;

  setTextureUpper(event:Event)
  {
    this.currentMaterialProperties.TextureProperties[0].upper =parseFloat((event.target as HTMLInputElement).value);
    this.textureService.setTexture(this.currentMaterialProperties.TextureProperties[0],this.currentMaterialProperties.name)

  }
  setTextureLower(event:Event)
  {
    this.currentMaterialProperties.TextureProperties[0].lower =parseFloat((event.target as HTMLInputElement).value);
    this.textureService.setTexture(this.currentMaterialProperties.TextureProperties[0],this.currentMaterialProperties.name)

  }
  
  setItteration(event:Event)
  {
    this.currentMaterialProperties.TextureProperties[0].itter =parseFloat((event.target as HTMLInputElement).value);
    this.textureService.setTexture(this.currentMaterialProperties.TextureProperties[0],this.currentMaterialProperties.name)

  }
  setTextureScale(event:Event)
  {
    this.currentMaterialProperties.TextureProperties[0].scale =parseFloat((event.target as HTMLInputElement).value);
    this.textureService.setTexture(this.currentMaterialProperties.TextureProperties[0],this.currentMaterialProperties.name)

  }
  changeProceduralTextureType(event: Event) {
    this.currentMaterialProperties.TextureProperties.name = (
      event.target as HTMLInputElement
    ).value as TextureType;
    if (
      this.currentMaterialProperties.TextureProperties[0].name ==
      TextureType.VALUE
    ) {
      this.currentMaterialProperties.TextureProperties[0].itter = 1.0;
    } else {
      this.currentMaterialProperties.TextureProperties[0].itter = null;
    }
   
    this.textureService.setTexture(this.currentMaterialProperties.TextureProperties[0],this.currentMaterialProperties.name);
        
  }
  changeTextureColor(event:Event, index:number)
  {
    if(index==1)
      {
        this.currentMaterialProperties.TextureProperties[0].color1 =(event.target as HTMLInputElement).value;
        const color = this.hexToRgb2(this .currentMaterialProperties.value);
        this.textureService.setTexture( this.currentMaterialProperties.TextureProperties[0],
          this.currentMaterialProperties.name
        );
      
      }
  else
  {
    this.currentMaterialProperties.TextureProperties[0].color2 =(event.target as HTMLInputElement).value;
    const color = this.hexToRgb2(this .currentMaterialProperties.value);
    this.textureService.setTexture( this.currentMaterialProperties.TextureProperties[0],
      this.currentMaterialProperties.name
    );
  
  }
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
        return;
    } 
    this.currentMaterialProperties.value =(event.target as HTMLInputElement).value;
    this.textureService.setValue(
      `float(${this.currentMaterialProperties.value})`,
      this.currentMaterialProperties.name
    );
  }
  selectedLight: Light | undefined;
  constructor(
    private lightService: LightService,
    private textureService: TextureService,
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
   
        this.textureService.setTexture(this.currentMaterialProperties.TextureProperties[0],this.currentMaterialProperties.name);
   
  }

  closeImageComponent() {
    this.currentMaterialProperties.isTexture = false;
    this.currentMaterialProperties.isImageTexture = false;
  }

  addImageTexture() {
    this.currentMaterialProperties.isTexture = true;
    this.currentMaterialProperties.isImageTexture = true;
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
    console.log(this.currentMaterialProperties);
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
          return;
        }
        if (this.currentMaterialProperties.name == 'roughness') {
          this.textureService.setValue(
            ` clamp(RGBtoBW(texture2D(u_roughnessImageTexture, v_texCoord)),0.01,0.90)`,
            this.currentMaterialProperties.name
          );
          return;
        }

       
        if (this.currentMaterialProperties.name == 'color') {
          this.textureService.setValue(
            ` clamp(RGBtoBW(texture2D(u_colorImageTexture, v_texCoord)),0.01,0.90)`,
            this.currentMaterialProperties.name
          );
          return;
        }
        if (this.currentMaterialProperties.name == 'normal') {
          this.textureService.setValue(
            ` clamp(RGBtoBW(texture2D(u_normalImageTexture, v_texCoord)),0.01,0.90)`,
            this.currentMaterialProperties.name
          );
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
      this.currentMaterialProperties.ImageTexture.src = imageUrl; // Set the src attribute of the Image object to the data URL
      // Optionally, you can add an onload event handler to execute code when the image is loaded
      this.currentMaterialProperties.ImageTexture.onload = () => {
        this.sceneService.renderImageTexture(this.currentMaterialProperties.ImageTexture
          , type);
      };
    };
    reader.readAsDataURL(file);
  }
}
