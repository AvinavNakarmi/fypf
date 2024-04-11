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

}
