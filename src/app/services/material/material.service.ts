import { Injectable } from '@angular/core';
import { TextureType } from 'src/app/enum/texture-type';

@Injectable({
  providedIn: 'root',
})
export class MaterialService {
  materialProperties: any[] = [
    {
      name: 'metallic',
      value: 0.5,
      isTexture: false,
      isImageTexture: false,
      ImageTexture: null,
      ImgSrc: '',

      isSetImageTexture: false,
      TextureProperties: [
        {
          name: TextureType.PERLIN,
          scale: 10.0,
          upper: 0.9,
          lower: 0.1,
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
      ImgSrc: '',

      isSetImageTexture: false,
      TextureProperties: [
        {
          name: TextureType.PERLIN,
          scale: 10.0,
          upper: 0.9,
          lower: 0.1,
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
      value: '#ffffff',
      isTexture: false,
      isImageTexture: false,
      ImageTexture: null,
      ImgSrc: '',

      isSetImageTexture: false,
      TextureProperties: [
        {
          name: TextureType.PERLIN,
          scale: 1,
          upper: 0.9,
          lower: 0.1,
          color1: '#ffffff',
          color2: '#000000',
          itter: null,
        },
      ],
    },
    {
      name: 'normal',
      value: 'v_normal.xyz',
      isTexture: false,
      isImageTexture: false,
      ImageTexture: null,

      isSetImageTexture: false,
      TextureProperties: [
        {
          name: TextureType.PERLIN,
          scale: 1,
          upper: 0.9,
          lower: 0.1,
          itter: null,
        },
      ],
    },
  ];

  getAllMaterialProperties() {
    return this.materialProperties;
  }

  setMaterialProperties(material: string, materialProperty: any) {
    if (material == 'metallic') {
      this.materialProperties[0] = materialProperty;
    }
    if (material == 'roughness') {
      this.materialProperties[1] = materialProperty;
    }
    if (material == 'IOR') {
      this.materialProperties[2] = materialProperty;
    }
    if (material == 'color') {
      this.materialProperties[3] = materialProperty;
    }
    if (material == 'normal') {
      this.materialProperties[4] = materialProperty;
    }
  }

  constructor() {}
}
