import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { LightType } from 'src/app/enum/light-type';
import { Light } from 'src/app/model/light.model';

@Injectable({
  providedIn: 'root',
})
export class LightService {
  light$: Subject<Light[]>;
  lastLightId: number;
  currentLightData: Light[] = [];

  constructor(private toastr: ToastrService) {
    this.light$ = new Subject<Light[]>();
    this.lastLightId = 0;
    this.light$.subscribe((data) => (this.currentLightData = data));
  }

  addlight(lightType:LightType) {
    if(this.currentLightData.length>=10)
    {
      this.toastr.error("cannot have more than10 lights");
      return;
    }
    const newLight:Light = {lightName:`light ${ this.lastLightId}`,LightID:this.lastLightId,  lightType:lightType,
    color:[255,255,255],
    position:[1,1,1],
    intencity:5.0};
    this.currentLightData.push(newLight);
    this.light$.next(this.currentLightData);
    this.lastLightId++;
    this.toastr.success("light is added");

  }

  removelight(lightId: number) {
    const newLightData = this.currentLightData.filter((light) => {
      return light.LightID != lightId;
    });
    this.light$.next(newLightData);
    this.toastr.success("light is delete");

  }
  editLight(lightId: number, light: Light) {
    const newLightData = this.currentLightData.map((data) => {
      if (data.LightID==lightId) {
        return light;
      }
      return data;
    });
    this.light$.next(newLightData);
  }
  getLights(): Observable<Light[]> {
    return this.light$.asObservable();
  }
}
