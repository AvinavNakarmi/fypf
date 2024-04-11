import { Component } from '@angular/core';
import { LightType } from 'src/app/enum/light-type';
import { ObjectType } from 'src/app/enum/object-type';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent {
 readonly allLightType:LightType[]=Object.values(LightType);
 readonly allObjectType:ObjectType[]=Object.values(ObjectType);

  constructor()
  {
  }
  changeObject(objectType:ObjectType)
  {
console.log(objectType);
  }
  addLight(lightType:LightType)
  {
    console.log(lightType);

  }


}
