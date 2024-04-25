import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TextureService {

  constructor() { }
  
  addRoughness(value:number)
  {
    return `roughness = float(${value});`;
  }
  addMetalicness(value:number)
  {
    return ` metalicness  = float(${value});`;
  }
  addPerlinnNoise()
  {
    return ``;
  }
  addColor(value:number[])
  {
    return `meshColor = vec3( float(${value[0]}), float(${value[1]}), float(${value[2]}));`
  }
}
