import { LightType } from "../enum/light-type";

export interface Light {
    lightName:string;
    LightID:number;
    lightType:LightType;
    color:number[];
    position:number[];
    intencity:number;
}
