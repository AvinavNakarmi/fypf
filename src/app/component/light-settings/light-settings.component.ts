import { Component, OnInit } from '@angular/core';
import { isEmpty } from 'rxjs';
import { Light } from 'src/app/model/light.model';
import { LightService } from 'src/app/services/light/light.service';

@Component({
  selector: 'app-light-settings',
  templateUrl: './light-settings.component.html',
  styleUrls: ['./light-settings.component.scss']
})
export class LightSettingsComponent implements OnInit{
  lights:Light[]=[];
  selectedLight:Light|undefined;
constructor(private lightService:LightService){
  this.lightService.getLights().subscribe(data=> this.lights=data);
}

  ngOnInit(): void {
    
  }

deleteLight(lightId:number)
{
  if(this.selectedLight && this.selectedLight.LightID==lightId)
{
  this.selectedLight =undefined;
}
this.lightService.removelight(lightId); 

}
displayLightData(light:Light)
{
  this.selectedLight = light;
}
changeLight()
{
  if(this.selectedLight)
    {
      this.lightService.editLight(this.selectedLight.LightID,this.selectedLight);
    }

}

get modifiedData():string{
  
  if(this.selectedLight)
    {
      
      return this.RGBTohex(this.selectedLight.color);
    }
  
    return "#ffffff";
  }

set modifiedData(value: string) {
  if( this.selectedLight)
    {
      this.hexToRgb(value);

    }

}

RGBTohex(rgb:number[])
{
  let rHex = rgb[0].toString(16);
  let r =rHex.length == 1 ? "0" + rHex :  rHex;
  
  let gHex = rgb[1].toString(16);
  let g = gHex.length == 1 ? "0" + gHex :  gHex;

  let bHex = rgb[2].toString(16);
  let b = bHex.length == 1 ? "0" + bHex :  bHex;

  return "#" + r + g + b;
  
}
hexToRgb(hex:string) {
  hex = hex.replace(/^#/, '');

  var r = parseInt(hex.substring(0, 2), 16);
  var g = parseInt(hex.substring(2, 4), 16);
  var b = parseInt(hex.substring(4, 6), 16);
if(this.selectedLight)
  {
    this.selectedLight.color=[r,g,b];
  }
}
lightStyle(index: number)
{
  if(!this.selectedLight)
    {
    return "light-inactive";

    }

    if(this.selectedLight.LightID==index)
      {
      return "light-active";

      }
      return "light-inactive";

}

}
